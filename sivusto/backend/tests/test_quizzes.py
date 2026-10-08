import pytest

@pytest.fixture
def created_quiz(client):
    response = client.post("/quizzes", json={
        "name": "test quiz",
        "questions": [
            {
                "question_text": "Mikä väri on majakassa?",
                "position": 1,
                "options": [
                    {
                        "option_text": "Punainen",
                        "is_correct": True,
                        "position": 1,
                    },
                    {
                        "option_text": "Sininen",
                        "is_correct": False,
                        "position": 2,
                    },
                ],
            }
        ],
    })

    assert response.status_code == 201
    return response.json()


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_quiz_invalid_uuid(client, method):
    response = client.request(
        method.upper(),
        "/quizzes/not-a-valid-uuid",
        json={"name": "updated quiz"} if method == "put" else None,
    )

    assert response.status_code == 422


def test_get_empty_quizzes(client):
    response = client.get("/quizzes")

    assert response.status_code == 200

    assert response.json() == []


def test_create_quiz_with_name_only(client):
    response = client.post(
        "/quizzes",
        json={
            "name": "test quiz"
        }
    )

    data = response.json()

    assert response.status_code == 201
    assert data["name"] == "test quiz"
    assert "id" in data
    assert data["questions"] == []


def test_create_quiz_with_questions(client):
    response = client.post(
            "/quizzes",
            json={
                "name": "test quiz",
                "questions": [
                    {
                        "question_text": "Mikä väri on majakassa?",
                        "position": 1,
                        "options": [
                            {
                            "option_text": "Punainen",
                            "is_correct": True,
                            "position": 1
                            },
                            {
                            "option_text": "Sininen",
                            "is_correct": False,
                            "position": 2
                            }
                        ]
                    }
                ]
            }
    )

    data = response.json()

    assert response.status_code == 201
    assert "id" in data

    assert data["name"] == "test quiz"
    assert len(data["questions"]) == 1

    question = data["questions"][0]

    assert question["question_text"] == "Mikä väri on majakassa?"
    assert question["position"] == 1
    assert len(question["options"]) == 2

    assert question["options"][0]["option_text"] == "Punainen"
    assert question["options"][0]["is_correct"] is True

    assert question["options"][1]["option_text"] == "Sininen"
    assert question["options"][1]["is_correct"] is False


def test_create_quiz_with_invalid_questions(client):
    response = client.post(
        "/quizzes",
        json={
            "name": "test quiz",
            "questions": "not-a-list",
        },
    )

    assert response.status_code == 422


def test_get_created_quiz(client, created_quiz):
    quiz_id = created_quiz["id"]

    response = client.get(f"/quizzes/{quiz_id}")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == quiz_id
    assert data["name"] == "test quiz"
    assert len(data["questions"]) == 1


def test_get_quiz_invalid_id(client):
    response = client.get("/quizzes/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_update_quiz(client, created_quiz):
    quiz_id = created_quiz["id"]

    response = client.put(
        f"/quizzes/{quiz_id}",
        json={
            "name": "updated quiz",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == quiz_id
    assert data["name"] == "updated quiz"

    assert len(data["questions"]) == 1

    get_response = client.get(f"/quizzes/{quiz_id}")

    assert get_response.status_code == 200
    assert get_response.json()["name"] == "updated quiz"


def test_update_quiz_preserves_questions_and_options(client, created_quiz):
    quiz_id = created_quiz["id"]

    response = client.put(
        f"/quizzes/{quiz_id}",
        json={"name": "updated quiz"},
    )

    assert response.status_code == 200

    data = response.json()
    question = data["questions"][0]

    assert question["question_text"] == "Mikä väri on majakassa?"
    assert len(question["options"]) == 2
    assert question["options"][0]["option_text"] == "Punainen"


def test_update_quiz_invalid_id(client):
    response = client.put(
            "/quizzes/00000000-0000-0000-0000-000000000000",
            json={
                "name": "updated quiz",
            },
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_delete_quiz(client, created_quiz):
    quiz_id = created_quiz["id"]

    response = client.delete(f"/quizzes/{quiz_id}")

    assert response.status_code == 204

    get_response = client.get(f"/quizzes/{quiz_id}")

    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Quiz not found"


def test_delete_quiz_invalid_id(client):
    response = client.delete("/quizzes/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_delete_quiz_deletes_questions_and_options(client, created_quiz):
    quiz_id = created_quiz["id"]
    question = created_quiz["questions"][0]
    question_id = question["id"]
    option_id = question["options"][0]["id"]

    response = client.delete(f"/quizzes/{quiz_id}")

    assert response.status_code == 204

    question_response = client.get(f"/quiz-questions/{question_id}")
    option_response = client.get(f"/quiz-question-options/{option_id}")

    assert question_response.status_code == 404
    assert option_response.status_code == 404