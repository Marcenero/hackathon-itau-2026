from typing import Literal
from pydantic import BaseModel, Field

SurveyType = Literal[
    "qualitative",
    "quantitative",
    "discovery",
]

ScoreMode = Literal[
    "explicit",
    "inferred",
    "none",
]

Category = Literal[
    "navegacao",
    "clareza",
    "performance",
    "erro",
    "outro",
]

Sentiment = Literal[
    "positivo",
    "neutro",
    "negativo",
]

Signal = Literal[
    "frustracao",
    "duvida",
    "elogio",
    "neutro",
]


class SurveyCreate(BaseModel):
    title: str
    question: str
    survey_type: SurveyType

    context: str | None = None
    profile: str | None = None

    options: list[str] | None = None

    validity_days: int = 30
    score_mode: ScoreMode = "explicit"


class ResponseCreate(BaseModel):
    score: int | None = Field(
        default=None,
        ge=1,
        le=10,
    )
    text: str


class FeedbackItem(BaseModel):
    response_id: int
    category: Category
    sentiment: Sentiment
    signal: Signal
    inferred_score: int | None = None
    summary: str


class FeedbackBatch(BaseModel):
    analyses: list[FeedbackItem]


class ReportOutput(BaseModel):
    summary: str
    investigation_question: str


class ReviewAnalysis(BaseModel):
    category: Category
    reviewer: str = "Squad"