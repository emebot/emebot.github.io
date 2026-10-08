# Existence and consistency checks shared by the quiz routers.
#
# Without these the routers hand a bad foreign key straight to Postgres, which
# answers with an IntegrityError and turns into a 500 instead of a 404.

from uuid import UUID
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models


def require_iala_light(db: Session, iala_light_id: Optional[UUID]) -> None:
    """Reject a reference to an IALA light that does not exist.

    A null reference is allowed: the column is nullable.
    """
    if iala_light_id is None:
        return

    exists = (
        db.query(models.IalaLight.id)
        .filter(models.IalaLight.id == iala_light_id)
        .first()
    )

    if exists is None:
        raise HTTPException(status_code=404, detail="IALA light not found")


def require_question(db: Session, question_id: UUID) -> models.QuizQuestion:
    question = (
        db.query(models.QuizQuestion)
        .filter(models.QuizQuestion.id == question_id)
        .first()
    )

    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    return question


def require_option(db: Session, option_id: UUID) -> models.QuizQuestionOption:
    option = (
        db.query(models.QuizQuestionOption)
        .filter(models.QuizQuestionOption.id == option_id)
        .first()
    )

    if option is None:
        raise HTTPException(status_code=404, detail="Option not found")

    return option


def require_answer_is_consistent(
    db: Session,
    quiz_id: UUID,
    question_id: UUID,
    selected_option_id: UUID,
) -> None:
    """Check that an answer points at a question of this quiz and one of its options.

    The foreign keys alone allow answering a question from another quiz, or
    picking an option that belongs to a different question.
    """
    question = require_question(db, question_id)

    if question.quiz_id != quiz_id:
        raise HTTPException(
            status_code=400,
            detail="Question does not belong to the attempted quiz",
        )

    option = require_option(db, selected_option_id)

    if option.question_id != question_id:
        raise HTTPException(
            status_code=400,
            detail="Selected option does not belong to the question",
        )
