# Quiz question option endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from security import require_admin
import models
import schemas
import validation

router = APIRouter(tags=["quiz_question_options"])

admin_only = [Depends(require_admin)]


@router.get("/quiz-questions/{question_id}/options", response_model=list[schemas.QuizQuestionOptionResponse])
def list_options(question_id: UUID, db: Session = Depends(get_db)):
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return db.query(models.QuizQuestionOption).filter(models.QuizQuestionOption.question_id == question_id).order_by(models.QuizQuestionOption.position).all()


@router.get("/quiz-question-options/{option_id}", response_model=schemas.QuizQuestionOptionResponse)
def get_option(option_id: UUID, db: Session = Depends(get_db)):
    option = db.query(models.QuizQuestionOption).filter(models.QuizQuestionOption.id == option_id).first()
    
    if option is None:
        raise HTTPException(status_code=404, detail="Option not found")
    
    return option


@router.post("/quiz-questions/{question_id}/options", status_code=201, response_model=schemas.QuizQuestionOptionResponse, dependencies=admin_only)
def create_option(question_id: UUID, option: schemas.QuizQuestionOptionCreate, db: Session = Depends(get_db)):
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    validation.require_iala_light(db, option.iala_light_id)

    db_option = models.QuizQuestionOption(
        question_id=question_id,
        option_text=option.option_text,
        iala_light_id=option.iala_light_id,
        is_correct=option.is_correct,
        position=option.position,
    )
    db.add(db_option)
    db.commit()
    db.refresh(db_option)
    return db_option


@router.put("/quiz-question-options/{option_id}", response_model=schemas.QuizQuestionOptionResponse, dependencies=admin_only)
def update_option(option_id: UUID, option: schemas.QuizQuestionOptionUpdate, db: Session = Depends(get_db)):
    db_option = db.query(models.QuizQuestionOption).filter(models.QuizQuestionOption.id == option_id).first()
    
    if db_option is None:
        raise HTTPException(status_code=404, detail="Option not found")

    fields = option.model_dump(exclude_unset=True)

    if "iala_light_id" in fields:
        validation.require_iala_light(db, fields["iala_light_id"])
        db_option.iala_light_id = fields["iala_light_id"]

    if "option_text" in fields:
        db_option.option_text = fields["option_text"]

    # is_correct and position are NOT NULL, so null means "leave them alone".
    if fields.get("is_correct") is not None:
        db_option.is_correct = fields["is_correct"]

    if fields.get("position") is not None:
        db_option.position = fields["position"]

    db.commit()
    db.refresh(db_option)
    return db_option


@router.delete("/quiz-question-options/{option_id}", status_code=204, dependencies=admin_only)
def delete_option(option_id: UUID, db: Session = Depends(get_db)):
    option = db.query(models.QuizQuestionOption).filter(models.QuizQuestionOption.id == option_id).first()
    
    if option is None:
        raise HTTPException(status_code=404, detail="Option not found")
    
    db.delete(option)
    db.commit()
    
    return Response(status_code=204)
