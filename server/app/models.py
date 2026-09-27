from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
)

from .database import Base


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True)

    title = Column(String(200), nullable=False)
    question = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True)

    survey_id = Column(
        Integer,
        ForeignKey("surveys.id"),
        nullable=False,
    )

    # Nulo para respostas vindas de pesquisas conversacionais
    # (qualitativa / discovery), que não têm nota numérica.
    score = Column(Integer, nullable=True)
    text = Column(Text, nullable=False)

    # "quantitativa" | "qualitativa" | "discovery"
    mode = Column(
        String(30),
        nullable=False,
        default="quantitativa",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True)

    response_id = Column(
        Integer,
        ForeignKey("responses.id"),
        unique=True,
        nullable=False,
    )

    category = Column(String(50), nullable=False)
    sentiment = Column(String(30), nullable=False)
    summary = Column(Text, nullable=False)

    final_category = Column(
        String(50),
        nullable=True,
    )

    status = Column(
        String(30),
        default="pending",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)

    survey_id = Column(
        Integer,
        ForeignKey("surveys.id"),
        nullable=False,
    )

    summary = Column(Text, nullable=False)

    investigation_question = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )