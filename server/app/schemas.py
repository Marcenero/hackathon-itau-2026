from typing import Literal, Optional
from pydantic import BaseModel


Category = Literal[
    "navegacao",
    "clareza",
    "performance",
    "erro",
    "elogio",
    "outro",
]

Sentiment = Literal[
    "positivo",
    "neutro",
    "negativo",
]

SurveyMode = Literal[
    "quantitativa",
    "qualitativa",
    "discovery",
]


class ResponseCreate(BaseModel):
    # Pesquisas conversacionais (qualitativa / discovery) não têm
    # uma nota numérica associada, por isso o score é opcional.
    score: Optional[int] = None
    text: str
    mode: SurveyMode = "quantitativa"


class ChatMessage(BaseModel):
    role: Literal["assistant", "user"]
    content: str


class ChatRequest(BaseModel):
    mode: Literal["qualitativa", "discovery"]
    history: list[ChatMessage] = []


class ChatTurnOutput(BaseModel):
    reply: str
    finished: bool


class FeedbackItem(BaseModel):
    response_id: int
    category: Category
    sentiment: Sentiment
    summary: str


class FeedbackBatch(BaseModel):
    analyses: list[FeedbackItem]


class ReportOutput(BaseModel):
    summary: str
    investigation_question: str


class ReviewAnalysis(BaseModel):
    category: Category