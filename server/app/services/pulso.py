from google import genai
from google.genai import types

from ..database import settings
from ..schemas import FeedbackBatch, ReportOutput, ChatTurnOutput


client = genai.Client(
    api_key=settings.gemini_api_key
)

# Rótulo amigável e limite de perguntas de acompanhamento por modo
# de pesquisa conversacional. O limite é apenas uma orientação para
# o modelo: o backend também garante um corte determinístico caso o
# modelo não finalize a conversa sozinho.
CHAT_MODES = {
    "qualitativa": {
        "label": "pesquisa qualitativa",
        "max_questions": 3,
    },
    "discovery": {
        "label": "discovery interview",
        "max_questions": 5,
    },
}


def _format_history(history):
    if not history:
        return "(a conversa ainda não começou)"

    lines = [
        f"{'Pulso' if message.role == 'assistant' else 'Cliente'}: {message.content}"
        for message in history
    ]

    return "\n".join(lines)


def analyze_feedbacks(responses):
    feedback_text = "\n".join(
        [
            f"""
ID: {r.id}
Nota: {r.score}
Resposta: {r.text}
"""
            for r in responses
        ]
    )

    prompt = f"""
Você é o Pulso, um agente de apoio a uma squad de produto.

Sua única tarefa é estruturar feedbacks de clientes.

Categorias permitidas:
- navegacao
- clareza
- performance
- erro
- elogio
- outro

Sentimentos permitidos:
- positivo
- neutro
- negativo

Não calcule métricas.
Não recomende mudanças no produto.
Não invente informações.
Analise apenas o texto fornecido.

Feedbacks:

{feedback_text}
"""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=FeedbackBatch,
            temperature=0.2,
        ),
    )

    return response.parsed


def generate_report(metrics, evidence):
    prompt = f"""
Você é o Pulso, agente de apoio à análise de feedback.

Os números abaixo foram calculados pelo sistema.
NÃO recalcule e NÃO altere os valores.

Métricas:
{metrics}

Evidências:
{evidence}

Produza:

1. Um resumo curto do principal padrão encontrado.
2. Uma pergunta para investigação pela squad.

Não recomende uma decisão.
Não diga que algo é causa sem evidência.
A decisão final pertence à squad.
"""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReportOutput,
            temperature=0.2,
        ),
    )

    return response.parsed


def run_chat_turn(survey, mode, history):
    """
    Conduz um turno da conversa do Pulso com o cliente.

    O Pulso apenas conversa e decide quando encerrar (finished=True).
    Quem decide quantas mensagens já foram trocadas e persiste a
    resposta final é o backend/frontend, não o modelo.
    """

    config = CHAT_MODES.get(mode, CHAT_MODES["qualitativa"])

    already_asked = sum(
        1 for message in history if message.role == "assistant"
    )

    prompt = f"""
Você é o Pulso, um agente de pesquisa que conversa por chat com um cliente
para entender melhor a experiência dele com um produto financeiro.

Tipo de conversa: {config["label"]}
Tema da pesquisa: {survey.question}

Regras:
- Faça no máximo uma pergunta por mensagem.
- Seja breve (1 a 3 frases), natural e empático, como em uma conversa real
  de chat. Não use listas nem markdown.
- Nunca repita uma pergunta que já foi feita.
- Você pode fazer no máximo {config["max_questions"]} perguntas de
  acompanhamento no total. Você já fez {already_asked} pergunta(s) até agora.
- Quando já tiver informação suficiente, ou ao atingir o limite de
  perguntas, agradeça brevemente e marque "finished" como true. Nesse caso
  a mensagem deve ser apenas um agradecimento curto, sem nova pergunta.
- Não avalie, não julgue e não sugira soluções. Apenas escute e pergunte.
- Não invente informações que o cliente não disse.

Histórico da conversa até agora:
{_format_history(history)}

Gere a próxima mensagem do Pulso nesta conversa.
"""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ChatTurnOutput,
            temperature=0.4,
        ),
    )

    return response.parsed