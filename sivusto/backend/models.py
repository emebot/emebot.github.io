# SQLAlchemy ORM models

import enum
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        default=UserRole.USER,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Ordered so the nested serialization matches GET /quizzes/{id}/questions.
    questions = relationship(
        "QuizQuestion",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuizQuestion.position",
    )
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    iala_light_id = Column(UUID(as_uuid=True), ForeignKey("iala_lights.id", ondelete="SET NULL"), nullable=True, index=True)
    question_text = Column(Text, nullable=True)
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    iala_light = relationship("IalaLight", back_populates="questions")
    # Ordered so the nested serialization matches GET /quiz-questions/{id}/options.
    options = relationship(
        "QuizQuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuizQuestionOption.position",
    )
    responses = relationship("QuizResponse", back_populates="question", cascade="all, delete-orphan")


class QuizQuestionOption(Base):
    __tablename__ = "quiz_question_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    iala_light_id = Column(UUID(as_uuid=True), ForeignKey("iala_lights.id", ondelete="SET NULL"), nullable=True, index=True)
    option_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    question = relationship("QuizQuestion", back_populates="options")
    iala_light = relationship("IalaLight", back_populates="options")
    responses = relationship("QuizResponse", back_populates="selected_option", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    # created_at ties within a transaction, so id breaks the tie deterministically.
    responses = relationship(
        "QuizResponse",
        back_populates="attempt",
        cascade="all, delete-orphan",
        order_by="QuizResponse.created_at, QuizResponse.id",
    )


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_id = Column(UUID(as_uuid=True), ForeignKey("quiz_question_options.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    attempt = relationship("QuizAttempt", back_populates="responses")
    question = relationship("QuizQuestion", back_populates="responses")
    selected_option = relationship("QuizQuestionOption", back_populates="responses")


class IalaLight(Base):
    __tablename__ = "iala_lights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    rhythm = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    config = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    questions = relationship("QuizQuestion", back_populates="iala_light")
    options = relationship("QuizQuestionOption", back_populates="iala_light")