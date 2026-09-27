from google import genai
from google.genai import types

from ..database import settings
from ..schemas import FeedbackBatch, ReportOutput


client = genai.Client(
    api_key=settings.gemini_api_key
)


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

        Sua tarefa é estruturar feedbacks de clientes.

        Categorias permitidas:
        - navegacao
        - clareza
        - performance
        - erro
        - outro

        Sentimentos permitidos:
        - positivo
        - neutro
        - negativo

        Sinais permitidos:
        - frustracao
        - duvida
        - elogio
        - neutro

        Para cada feedback, retorne:
        - categoria
        - sentimento
        - sinal
        - resumo

        REGRAS PARA inferred_score:

        - Se "Nota" possuir um valor de 1 a 10:
        retorne inferred_score = null.

        - Se "Nota" for None ou nula:
        estime inferred_score entre 1 e 10
        exclusivamente a partir do relato do cliente.

        Referência:
        - 1 a 3: experiência claramente negativa
        - 4 a 6: experiência negativa ou neutra com ressalvas
        - 7 a 8: experiência predominantemente positiva
        - 9 a 10: experiência claramente positiva

        A nota inferida representa uma estimativa da percepção
        expressa no texto. Não invente contexto.

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