# Quiz question endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, selectinload

from database import get_db
from security import require_admin
import models
import schemas
import validation

router = APIRouter(tags=["quiz_questions"])

admin_only = [Depends(require_admin)]


@router.get("/quizzes/{quiz_id}/questions", response_model=list[schemas.QuizQuestionResponse])
def list_questions(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()

    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return (
        db.query(models.QuizQuestion)
        .options(selectinload(models.QuizQuestion.options))
        .filter(models.QuizQuestion.quiz_id == quiz_id)
        .order_by(models.QuizQuestion.position)
        .all()
    )


@router.get("/quiz-questions/{question_id}", response_model=schemas.QuizQuestionResponse)
def get_question(question_id: UUID, db: Session = Depends(get_db)):
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()

    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    return question


@router.post("/quizzes/{quiz_id}/questions", status_code=201, response_model=schemas.QuizQuestionResponse, dependencies=admin_only)
def create_question(quiz_id: UUID, question: schemas.QuizQuestionCreate, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()

    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    validation.require_iala_light(db, question.iala_light_id)

    for option in question.options:
        validation.require_iala_light(db, option.iala_light_id)

    db_question = models.QuizQuestion(
        quiz_id=quiz_id,
        question_text=question.question_text,
        iala_light_id=question.iala_light_id,
        position=question.position,
    )

    for option in question.options:
        db_question.options.append(
            models.QuizQuestionOption(
                option_text=option.option_text,
                iala_light_id=option.iala_light_id,
                is_correct=option.is_correct,
                position=option.position,
            )
        )

    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


@router.put("/quiz-questions/{question_id}", response_model=schemas.QuizQuestionResponse, dependencies=admin_only)
def update_question(question_id: UUID, question: schemas.QuizQuestionUpdate, db: Session = Depends(get_db)):
    db_question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()

    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    fields = question.model_dump(exclude_unset=True)

    if "iala_light_id" in fields:
        validation.require_iala_light(db, fields["iala_light_id"])
        db_question.iala_light_id = fields["iala_light_id"]

    if "question_text" in fields:
        db_question.question_text = fields["question_text"]

    # position is NOT NULL, so an explicit null means "leave it alone".
    if fields.get("position") is not None:
        db_question.position = fields["position"]

    db.commit()
    db.refresh(db_question)
    return db_question


@router.delete("/quiz-questions/{question_id}", status_code=204, dependencies=admin_only)
def delete_question(question_id: UUID, db: Session = Depends(get_db)):
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()

    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()

    return Response(status_code=204)
