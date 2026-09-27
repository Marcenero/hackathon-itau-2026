from typing import Literal
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


class ResponseCreate(BaseModel):
    score: int
    text: str


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