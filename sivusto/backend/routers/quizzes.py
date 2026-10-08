# Quiz endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, selectinload

from database import get_db
from security import require_admin
import models
import schemas
import validation

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

admin_only = [Depends(require_admin)]


# Loaded up front because the response schema serializes both levels.
NESTED = selectinload(models.Quiz.questions).selectinload(models.QuizQuestion.options)


@router.get("", response_model=list[schemas.QuizResponse])
def list_quizzes(db: Session = Depends(get_db)):
    return db.query(models.Quiz).options(NESTED).all()


@router.get("/{quiz_id}", response_model=schemas.QuizResponse)
def get_quiz(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).options(NESTED).filter(models.Quiz.id == quiz_id).first()

    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return quiz


@router.post("", status_code=201, response_model=schemas.QuizResponse, dependencies=admin_only)
def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    db_quiz = models.Quiz(name=quiz.name)

    for question in quiz.questions:
        validation.require_iala_light(db, question.iala_light_id)

        for option in question.options:
            validation.require_iala_light(db, option.iala_light_id)

        db_question = models.QuizQuestion(
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

        db_quiz.questions.append(db_question)

    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


@router.put("/{quiz_id}", response_model=schemas.QuizResponse, dependencies=admin_only)
def update_quiz(quiz_id: UUID, quiz: schemas.QuizUpdate, db: Session = Depends(get_db)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()

    if db_quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    fields = quiz.model_dump(exclude_unset=True)

    if "name" in fields:
        db_quiz.name = fields["name"]

    db.commit()
    db.refresh(db_quiz)
    return db_quiz


@router.delete("/{quiz_id}", status_code=204, dependencies=admin_only)
def delete_quiz(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()

    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db.delete(quiz)
    db.commit()

    return Response(status_code=204)
