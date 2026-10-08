# Quiz response endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from security import authorize_owner, get_current_user
import models
import schemas
import validation

router = APIRouter(tags=["quiz_responses"])


@router.get("/quiz-attempts/{attempt_id}/responses", response_model=list[schemas.QuizResponseItemSchema])
def list_responses(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    attempt = db.query(models.QuizAttempt).filter(models.QuizAttempt.id == attempt_id).first()

    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")

    authorize_owner(current_user, attempt.user_id)

    return (
        db.query(models.QuizResponse)
        .filter(models.QuizResponse.attempt_id == attempt_id)
        .order_by(models.QuizResponse.created_at, models.QuizResponse.id)
        .all()
    )


@router.get("/quiz-responses/{response_id}", response_model=schemas.QuizResponseItemSchema)
def get_response(
    response_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    response = db.query(models.QuizResponse).filter(models.QuizResponse.id == response_id).first()

    if response is None:
        raise HTTPException(status_code=404, detail="Response not found")

    authorize_owner(current_user, response.attempt.user_id)
    return response


@router.post("/quiz-attempts/{attempt_id}/responses", status_code=201, response_model=schemas.QuizResponseItemSchema)
def create_response(
    attempt_id: UUID,
    response: schemas.QuizResponseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    attempt = db.query(models.QuizAttempt).filter(models.QuizAttempt.id == attempt_id).first()

    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")

    authorize_owner(current_user, attempt.user_id)
    validation.require_answer_is_consistent(
        db,
        attempt.quiz_id,
        response.question_id,
        response.selected_option_id,
    )

    db_response = models.QuizResponse(
        attempt_id=attempt_id,
        question_id=response.question_id,
        selected_option_id=response.selected_option_id,
    )
    db.add(db_response)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This question has already been answered in this attempt",
        )

    db.refresh(db_response)
    return db_response


@router.delete("/quiz-responses/{response_id}", status_code=204)
def delete_response(
    response_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    response = db.query(models.QuizResponse).filter(models.QuizResponse.id == response_id).first()

    if response is None:
        raise HTTPException(status_code=404, detail="Response not found")

    authorize_owner(current_user, response.attempt.user_id)

    db.delete(response)
    db.commit()

    return Response(status_code=204)
