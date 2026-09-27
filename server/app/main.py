from collections import Counter

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Survey, Response, Analysis, Report
from .schemas import ResponseCreate, ReviewAnalysis
from .services.pulso import analyze_feedbacks, generate_report


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pulso API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exemplos para teste
@app.on_event("startup")
def seed():
    from .database import SessionLocal

    db = SessionLocal()

    try:
        survey = db.query(Survey).first()

        if not survey:
            survey = Survey(
                title="Experiência com comprovante Pix",
                question=(
                    "Como você avalia a facilidade "
                    "de encontrar o comprovante do Pix?"
                ),
            )

            db.add(survey)
            db.commit()

    finally:
        db.close()

@app.get("/surveys/{survey_id}")
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
):
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Pesquisa não encontrada",
        )

    return {
        "id": survey.id,
        "title": survey.title,
        "question": survey.question,
    }

@app.post("/surveys/{survey_id}/responses")
def create_response(
    survey_id: int,
    payload: ResponseCreate,
    db: Session = Depends(get_db),
):
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Pesquisa não encontrada",
        )

    response = Response(
        survey_id=survey_id,
        score=payload.score,
        text=payload.text,
    )

    db.add(response)
    db.commit()
    db.refresh(response)

    return {
        "id": response.id,
        "message": "Feedback registrado",
    }

@app.post("/surveys/{survey_id}/analyze")
def analyze_survey(
    survey_id: int,
    db: Session = Depends(get_db),
):
    responses = (
        db.query(Response)
        .filter(Response.survey_id == survey_id)
        .all()
    )

    already_analyzed = {
        item.response_id
        for item in db.query(Analysis).all()
    }

    pending = [
        response
        for response in responses
        if response.id not in already_analyzed
    ]

    if pending:
        result = analyze_feedbacks(pending)

        for item in result.analyses:
            analysis = Analysis(
                response_id=item.response_id,
                category=item.category,
                sentiment=item.sentiment,
                summary=item.summary,
            )

            db.add(analysis)

        db.commit()

    return {
        "message": "Análise concluída",
        "new_analyses": len(pending),
    }

@app.get("/surveys/{survey_id}/dashboard")
def dashboard(
    survey_id: int,
    db: Session = Depends(get_db),
):
    responses = (
        db.query(Response)
        .filter(Response.survey_id == survey_id)
        .all()
    )

    response_ids = [
        response.id
        for response in responses
    ]

    analyses = (
        db.query(Analysis)
        .filter(
            Analysis.response_id.in_(response_ids)
        )
        .all()
        if response_ids
        else []
    )

    total = len(responses)

    average_score = (
        round(
            sum(r.score for r in responses) / total,
            1,
        )
        if total
        else 0
    )

    categories = Counter(
        analysis.final_category
        or analysis.category
        for analysis in analyses
    )

    percentages = {
        category: round(
            count / len(analyses) * 100,
            1,
        )
        for category, count in categories.items()
    } if analyses else {}

    latest_report = (
        db.query(Report)
        .filter(Report.survey_id == survey_id)
        .order_by(Report.id.desc())
        .first()
    )

    return {
        "total_responses": total,
        "average_score": average_score,
        "categories": percentages,
        "analyses": [
            {
                "id": a.id,
                "response_id": a.response_id,
                "category": (
                    a.final_category
                    or a.category
                ),
                "original_category": a.category,
                "sentiment": a.sentiment,
                "summary": a.summary,
                "status": a.status,
            }
            for a in analyses
        ],
        "report": (
            {
                "summary": latest_report.summary,
                "investigation_question":
                    latest_report.investigation_question,
            }
            if latest_report
            else None
        ),
    }

@app.post("/surveys/{survey_id}/report")
def create_report(
    survey_id: int,
    db: Session = Depends(get_db),
):
    responses = (
        db.query(Response)
        .filter(Response.survey_id == survey_id)
        .all()
    )

    response_ids = [r.id for r in responses]

    analyses = (
        db.query(Analysis)
        .filter(
            Analysis.response_id.in_(response_ids)
        )
        .all()
    )

    if not analyses:
        raise HTTPException(
            status_code=400,
            detail="Analise os feedbacks primeiro",
        )

    categories = Counter(
        a.final_category or a.category
        for a in analyses
    )

    total = len(analyses)

    percentages = {
        name: round(value / total * 100, 1)
        for name, value in categories.items()
    }

    average_score = round(
        sum(r.score for r in responses) / len(responses)
    )

    metrics = {
        "total_responses": len(responses),
        "average_score": average_score,
        "categories": percentages,
    }

    evidence = [
        {
            "category": a.final_category or a.category,
            "summary": a.summary,
        }
        for a in analyses
    ]

    result = generate_report(
        metrics,
        evidence,
    )

    report = Report(
        survey_id=survey_id,
        summary=result.summary,
        investigation_question=(
            result.investigation_question
        ),
    )

    db.add(report)
    db.commit()

    return result

@app.patch("/analyses/{analysis_id}")
def review_analysis(
    analysis_id: int,
    payload: ReviewAnalysis,
    db: Session = Depends(get_db),
):
    analysis = db.get(
        Analysis,
        analysis_id,
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Análise não encontrada",
        )

    analysis.final_category = payload.category
    analysis.status = "reviewed"

    db.commit()

    return {
        "message": "Revisão registrada",
    }