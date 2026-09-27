# Pulso — Hackathon Itaú 2026

MVP desenvolvido para o **Hackathon Itaú 2026 — Case C: Jornada de Agentes**.

O **Pulso** é um agente de apoio a squads de produto que transforma feedbacks de clientes em informações estruturadas, métricas e sínteses rastreáveis.

A proposta segue o princípio:

> **A IA interpreta. O sistema calcula. O humano decide.**

O protótipo possui duas experiências:

- **Cliente:** responde uma pesquisa sobre sua experiência.
- **Squad:** acompanha os feedbacks, solicita análise do Pulso, visualiza métricas e gera uma síntese para investigação.

> Este projeto é um protótipo desenvolvido para o hackathon e não representa um produto oficial do Itaú. Todos os dados utilizados na demonstração devem ser fictícios.

---

## Funcionalidades do MVP

### Experiência do cliente

- Visualização de uma pesquisa.
- Avaliação de 1 a 10.
- Campo para feedback aberto.
- Persistência da resposta no PostgreSQL.

### Dashboard da squad

- Quantidade de respostas.
- Nota média.
- Categorização de feedbacks.
- Análise de sentimento.
- Resumo individual das respostas.
- Percentual por categoria.
- Síntese dos principais padrões.
- Questão sugerida para investigação.

### Pulso

O agente é responsável apenas pelas tarefas que exigem interpretação de linguagem natural:

- classificação de feedbacks;
- análise de sentimento;
- resumo dos relatos;
- síntese dos padrões encontrados.

Cálculos como média, contagem e percentuais são realizados de forma determinística pelo backend.

---

# Arquitetura

```text
                    CLIENTE
                       │
                       ▼
               Next.js / React
                       │
                       ▼
                    FastAPI
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
      PostgreSQL               Pulso / LLM
           │                       │
           └───────────┬───────────┘
                       ▼
                Dados estruturados
                       │
                       ▼
               Dashboard da Squad
                       │
                       ▼
                 Revisão humana
```

---

# Tecnologias

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Banco de dados

- PostgreSQL
- Docker

### Inteligência Artificial

- Gemini API
- Structured Outputs
- Categorias controladas pelo sistema

---

# Estrutura do projeto

```text
hackathon-itau-2026/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── cliente/
│   │   │   │   └── page.tsx
│   │   │   ├── squad/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   │
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── Sentiment.tsx
│   │   │
│   │   └── lib/
│   │       └── api.ts
│   │
│   └── .env.local
│
├── server/
│   ├── app/
│   │   ├── services/
│   │   │   └── pulso.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# Como rodar localmente

## Pré-requisitos

Antes de começar, tenha instalado:

- Git
- Node.js
- npm
- Python 3.12 ou superior
- Docker Desktop

Também é necessária uma chave de API válida para o modelo utilizado pelo Pulso.

---

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd hackathon-itau-2026
```

---

## 2. Subir o PostgreSQL

O PostgreSQL utilizado pelo projeto roda através do Docker.

Na raiz do projeto:

```bash
docker compose up -d
```

Verifique se o container está rodando:

```bash
docker compose ps
```

O banco ficará disponível em:

```text
localhost:5432
```

Configuração padrão:

```text
Database: pulso
User: pulso
Password: pulso
Port: 5432
```

---

## 3. Configurar o backend

Entre na pasta:

```bash
cd server
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### Linux / WSL / macOS

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

---

## 4. Configurar variáveis do backend

Crie:

```text
server/.env
```

Exemplo:

```env
DATABASE_URL=postgresql+psycopg://pulso:pulso@localhost:5432/pulso

GEMINI_API_KEY=SUA_CHAVE_AQUI

GEMINI_MODEL=MODELO_DISPONIVEL_NO_SEU_PROJETO
```

Nunca envie o arquivo `.env` para o GitHub.

Uma boa prática é manter no repositório apenas:

```text
server/.env.example
```

com:

```env
DATABASE_URL=postgresql+psycopg://pulso:pulso@localhost:5432/pulso

GEMINI_API_KEY=YOUR_API_KEY_HERE

GEMINI_MODEL=YOUR_MODEL_HERE
```

---

## 5. Rodar o FastAPI

Dentro de `server/`:

```bash
uvicorn app.main:app --reload
```

O backend ficará disponível em:

```text
http://127.0.0.1:8000
```

Documentação Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# Principais endpoints

### Obter pesquisa

```http
GET /surveys/1
```

---

### Enviar feedback

```http
POST /surveys/1/responses
```

Exemplo:

```json
{
  "score": 4,
  "text": "Não consegui encontrar o comprovante depois do Pix."
}
```

---

### Visualizar dashboard

```http
GET /surveys/1/dashboard
```

---

### Analisar novos feedbacks

```http
POST /surveys/1/analyze
```

O Pulso analisa somente respostas que ainda não possuem uma análise.

---

### Gerar síntese

```http
POST /surveys/1/report
```

A síntese utiliza as análises estruturadas e métricas previamente calculadas pelo sistema.

---

# 6. Configurar o frontend

Abra outro terminal e vá para:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie:

```text
frontend/.env.local
```

com:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 7. Rodar o frontend

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

---

# Páginas

## Página inicial

```text
http://localhost:3000
```

Apresentação geral do Pulso e acesso às duas experiências do protótipo.

---

## Experiência do cliente

```text
http://localhost:3000/cliente
```

Permite responder a pesquisa e enviar o feedback ao backend.

---

## Dashboard da squad

```text
http://localhost:3000/squad
```

Permite:

- visualizar resultados;
- analisar novos feedbacks;
- acompanhar categorias;
- visualizar sentimentos;
- gerar síntese com o Pulso.

---

# Fluxo recomendado para testar

Com frontend e backend rodando:

### 1. Acesse

```text
http://localhost:3000/cliente
```

### 2. Envie um feedback

Exemplo:

```text
Nota: 4

Não consegui encontrar o comprovante depois de fazer o Pix.
```

### 3. Acesse

```text
http://localhost:3000/squad
```

### 4. Clique em

```text
✨ Analisar novos feedbacks
```

### 5. Confira

- categoria;
- sentimento;
- resumo;
- percentuais atualizados.

### 6. Clique em

```text
✨ Gerar síntese
```

O Pulso irá gerar:

- resumo dos padrões encontrados;
- questão para investigação da squad.

---

# Como o uso de IA foi delimitado

O projeto evita utilizar modelos generativos em tarefas que podem ser resolvidas de forma simples e previsível.

## Determinístico

Executado pelo sistema:

```text
✓ persistência
✓ contagem
✓ nota média
✓ percentuais
✓ categorias permitidas
✓ associação entre pesquisa e respostas
✓ controle de quais respostas já foram analisadas
```

## Generativo

Executado pelo Pulso:

```text
✓ interpretação de linguagem natural
✓ categorização
✓ sentimento
✓ resumo
✓ síntese dos padrões
```

## Humano

Permanece responsável por:

```text
✓ investigar o problema
✓ validar os resultados
✓ interpretar o contexto
✓ priorizar ações
✓ tomar decisões de produto
```

---

# Categorias do MVP

Atualmente o Pulso pode classificar os feedbacks como:

```text
navegacao
clareza
performance
erro
elogio
outro
```

As categorias são pré-definidas pelo sistema.

O modelo não possui liberdade para criar categorias arbitrárias durante a análise.

---

# Reiniciar o banco de dados

Como os dados atuais são utilizados apenas para desenvolvimento e demonstração, é possível apagar completamente o PostgreSQL.

Na raiz:

```bash
docker compose down -v
```

Depois:

```bash
docker compose up -d
```

Ao subir o FastAPI novamente, as tabelas serão recriadas.

> Atenção: `docker compose down -v` apaga todos os dados persistidos no volume.

---

# Parar os serviços

Frontend:

```text
Ctrl + C
```

Backend:

```text
Ctrl + C
```

PostgreSQL:

```bash
docker compose stop
```

Para iniciar novamente:

```bash
docker compose up -d
```

---

# Problemas comuns

### Backend não conecta ao PostgreSQL

Confira:

```bash
docker compose ps
```

E teste se a porta está disponível no PowerShell:

```powershell
Test-NetConnection localhost -Port 5432
```

O esperado é:

```text
TcpTestSucceeded : True
```

---

### `ModuleNotFoundError: No module named 'psycopg'`

Ative o ambiente virtual e execute:

```bash
pip install "psycopg[binary]"
```

---

### Frontend retorna `Failed to fetch`

Confirme se o FastAPI está rodando:

```text
http://127.0.0.1:8000/docs
```

E confira:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Depois reinicie o Next.js:

```bash
npm run dev
```

---

### Erro de CORS

O FastAPI deve permitir o frontend local:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Modelo não disponível

A disponibilidade dos modelos pode depender da conta ou projeto da API.

Nesse caso, altere:

```env
GEMINI_MODEL=...
```

para um modelo disponível no projeto sem alterar o restante da arquitetura.

---

# Desenvolvimento em equipe

Antes de começar a trabalhar:

```bash
git pull
```

Crie uma branch:

```bash
git checkout -b nome-da-feature
```

Exemplos:

```bash
git checkout -b feat/dashboard
```

```bash
git checkout -b feat/revisao-humana
```

Depois:

```bash
git add .
git commit -m "feat: adiciona revisão humana"
git push origin feat/revisao-humana
```

Evite enviar diretamente:

```text
.env
.env.local
API keys
senhas
dados reais de clientes
```

---

# Próximas evoluções

Possíveis evoluções após o MVP:

- revisão humana das classificações;
- exibição da resposta original como evidência;
- agente conversacional na experiência do cliente;
- perguntas de aprofundamento adaptativas;
- criação de pesquisas por templates;
- comparação temporal;
- análise por segmento;
- busca semântica;
- histórico de alterações;
- score de confiança;
- roteamento entre modelos;
- observabilidade das chamadas de IA;
- governança por squads;
- autenticação e controle de acesso;
- integração com fontes reais de feedback.

---

# Contexto do MVP

O objetivo desta versão não é automatizar toda a jornada de produto.

O protótipo demonstra especificamente como uma squad pode utilizar IA para reduzir o trabalho necessário para transformar feedbacks não estruturados em informação revisável.

```text
Cliente
   ↓
Feedback
   ↓
Pulso interpreta
   ↓
Sistema calcula
   ↓
Squad investiga
   ↓
Humano decide
```

---

## Hackathon Itaú 2026

**Case C — Jornada de Agentes**

> Protótipo desenvolvido exclusivamente para fins de demonstração no Hackathon Itaú 2026.