from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    JSON,
)

from .database import Base


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True)

    title = Column(String(200), nullable=False)
    question = Column(Text, nullable=False)

    survey_type = Column(
        String(30),
        nullable=False,
        default="qualitative",
    )

    context = Column(Text, nullable=True)

    profile = Column(
        String(250),
        nullable=True,
    )

    options = Column(
        JSON,
        nullable=True,
    )

    validity_days = Column(
        Integer,
        nullable=False,
        default=30,
    )

    score_mode = Column(
        String(20),
        nullable=False,
        default="explicit",
    )

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

    score = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)

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