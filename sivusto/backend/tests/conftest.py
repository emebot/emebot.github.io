import pytest
import os
import psycopg
from fastapi.testclient import TestClient

from database import SessionLocal, get_db
from main import app
import models
from security import get_current_user

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://testuser:testpass@localhost:5433/testdb",
)

ENVIRONMENT = os.getenv("ENVIRONMENT")
if ENVIRONMENT != "testing":
    raise RuntimeError(
        "Refusing to run destructive test DB setup unless ENVIRONMENT=testing",
    )

PSYCOPG_DATABASE_URL = DATABASE_URL.replace(
    "postgresql+psycopg://",
    "postgresql://",
)

@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Runs the schema.sql file in the Docker test database once before the tests start."""
    schema_path = os.path.join(os.path.dirname(__file__), "..", "schema.sql")
    
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    with psycopg.connect(PSYCOPG_DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            cur.execute(schema_sql)
        conn.commit()


@pytest.fixture(autouse=True)
def clean_tables():
    """Clears data from all tables before each test."""
    tables = [
        "quiz_responses",
        "quiz_attempts",
        "quiz_question_options",
        "quiz_questions",
        "quizzes",
        "iala_lights",
        "users"
    ]
    
    with psycopg.connect(PSYCOPG_DATABASE_URL) as conn:
        with conn.cursor() as cur:
            truncate_query = f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE;"
            cur.execute(truncate_query)
        conn.commit()

# --- Shared fixtures ---
#
# Each one builds on the previous through the API, so a test only asks for the
# depth it needs. test_quizzes.py overrides created_quiz with a nested variant.


@pytest.fixture
def created_user(client):
    response = client.post(
        "/users",
        json={"username": "quiz-user", "password": "secret123"},
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def created_light(client):
    response = client.post(
        "/iala-lights",
        json={
            "name": "Vihrea sivuviitta",
            "category": "lateral",
            "rhythm": "Fl G 3s",
            "description": "Oikeanpuoleinen viitta",
            "config": {"color": "green"},
        },
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def created_quiz(client):
    response = client.post("/quizzes", json={"name": "test quiz"})
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def created_question(client, created_quiz):
    """A question with no options yet."""
    response = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Mika vari on vasemmanpuoleisessa viitassa?",
            "position": 1,
        },
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def answerable_question(client, created_quiz):
    """A question on created_quiz carrying two options, ready to be answered."""
    response = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Mika vari on oikeanpuoleisessa viitassa?",
            "position": 1,
            "options": [
                {"option_text": "Vihrea", "is_correct": True, "position": 1},
                {"option_text": "Punainen", "is_correct": False, "position": 2},
            ],
        },
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def created_option(client, created_question):
    response = client.post(
        f"/quiz-questions/{created_question['id']}/options",
        json={"option_text": "Punainen", "is_correct": True, "position": 1},
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def created_attempt(client, created_user, created_quiz):
    response = client.post(
        "/quiz-attempts",
        json={"user_id": created_user["id"], "quiz_id": created_quiz["id"]},
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
def anon_client():
    db = SessionLocal()

    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def client(anon_client):
    app.dependency_overrides[get_current_user] = lambda: models.User(role=models.UserRole.ADMIN)
    return anon_client