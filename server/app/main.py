from collections import Counter
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Survey, Response, Analysis, Report
from .schemas import ResponseCreate, ReviewAnalysis, SurveyCreate
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

@app.post("/surveys")
def create_survey(
    payload: SurveyCreate,
    db: Session = Depends(get_db),
):
    survey = Survey(
        title=payload.title,
        question=payload.question,
        survey_type=payload.survey_type,
        context=payload.context,
        profile=payload.profile,
        options=payload.options,
        validity_days=payload.validity_days,
        score_mode=payload.score_mode,
    )

    db.add(survey)
    db.commit()
    db.refresh(survey)

    return {
        "id": survey.id,
        "title": survey.title,
    }

@app.get("/surveys")
def list_surveys(
    db: Session = Depends(get_db),
):
    return db.query(Survey).all()

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
                signal=item.signal,
                inferred_score=item.inferred_score,
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
    survey = db.get(Survey, survey_id)

    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Pesquisa não encontrada",
        )

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

    response_by_id = {
        response.id: response
        for response in responses
    }

    qualitative_groups = {}

    for analysis in analyses:
        signal = analysis.signal

        if signal not in qualitative_groups:
            qualitative_groups[signal] = {
                "count": 0,
                "examples": [],
            }

        qualitative_groups[signal]["count"] += 1

        if (
            len(
                qualitative_groups[signal][
                    "examples"
                ]
            )
            < 2
        ):
            response = response_by_id.get(
                analysis.response_id
            )

            if response:
                qualitative_groups[signal][
                    "examples"
                ].append(
                    {
                        "response_id": response.id,
                        "text": response.text,
                        "validated": (
                            analysis.status
                            == "reviewed"
                        ),
                    }
                )

    total = len(responses)

    analysis_by_response = {
        analysis.response_id: analysis
        for analysis in analyses
    }

    scores = []
    inferred_count = 0

    for response in responses:
        if response.score is not None:
            scores.append(response.score)
            continue

        analysis = analysis_by_response.get(
            response.id
        )

        if (
            analysis
            and analysis.inferred_score is not None
        ):
            scores.append(
                analysis.inferred_score
            )

            inferred_count += 1

    average_score = (
        round(
            sum(scores) / len(scores),
            1,
        )
        if scores
        else None
    )

    categories = Counter(
        analysis.final_category
        or analysis.category
        for analysis in analyses
    )

    percentages = (
        {
            category: round(
                count / len(analyses) * 100,
                1,
            )
            for category, count
            in categories.items()
        }
        if analyses
        else {}
    )

    latest_report = (
        db.query(Report)
        .filter(
            Report.survey_id == survey_id
        )
        .order_by(Report.id.desc())
        .first()
    )

    latest_response_at = (
        max(
            response.created_at
            for response in responses
        )
        if responses
        else None
    )

    freshness_status = "no_data"

    if latest_response_at:
        age = (
            datetime.utcnow()
            - latest_response_at
        )

        age_days = (
            age.total_seconds()
            / 86400
        )

        ratio = (
            age_days
            / survey.validity_days
        )

        if ratio <= 0.5:
            freshness_status = "current"

        elif ratio <= 1:
            freshness_status = "attention"

        else:
            freshness_status = "revalidate"

    reviewed_count = sum(
        1
        for analysis in analyses
        if analysis.status == "reviewed"
    )

    validation_percentage = (
        round(
            reviewed_count
            / len(analyses)
            * 100
        )
        if analyses
        else 0
    )

    return {
        "total_responses": total,
        "average_score": average_score,
        "categories": percentages,
        "inferred_scores_count": inferred_count,
        "analyses": [
            {
                "id": analysis.id,
                "response_id":
                    analysis.response_id,
                "category": (
                    analysis.final_category
                    or analysis.category
                ),
                "original_category":
                    analysis.category,
                "sentiment":
                    analysis.sentiment,
                "summary":
                    analysis.summary,
                "status":
                    analysis.status,
            }
            for analysis in analyses
        ],
        "report": (
            {
                "summary":
                    latest_report.summary,
                "investigation_question":
                    latest_report
                    .investigation_question,
            }
            if latest_report
            else None
        ),
        "qualitative_summary":
            qualitative_groups,
        "freshness": {
            "last_response_at":
                latest_response_at,
            "validity_days":
                survey.validity_days,
            "status":
                freshness_status,
        },
        "validation": {
            "reviewed":
                reviewed_count,
            "total":
                len(analyses),
            "percentage":
                validation_percentage,
        },
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
    analysis.reviewed_by = payload.reviewer
    analysis.reviewed_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Revisão registrada",
    }