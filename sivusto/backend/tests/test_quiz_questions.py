import pytest


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_question_invalid_uuid(client, method):
    response = client.request(
        method.upper(),
        "/quiz-questions/not-a-valid-uuid",
        json={"question_text": "Updated question"} if method == "put" else None,
    )

    assert response.status_code == 422


def test_list_questions_returns_empty_list(client, created_quiz):
    response = client.get(f"/quizzes/{created_quiz['id']}/questions")

    assert response.status_code == 200
    assert response.json() == []


def test_list_questions_returns_questions_in_position_order(client, created_quiz):
    quiz_id = created_quiz["id"]
    client.post(
        f"/quizzes/{quiz_id}/questions",
        json={"question_text": "Second question", "position": 2},
    )
    client.post(
        f"/quizzes/{quiz_id}/questions",
        json={"question_text": "First question", "position": 1},
    )

    response = client.get(f"/quizzes/{quiz_id}/questions")

    assert response.status_code == 200
    assert [question["question_text"] for question in response.json()] == [
        "First question",
        "Second question",
    ]


def test_list_questions_for_missing_quiz_returns_not_found(client):
    response = client.get(
        "/quizzes/00000000-0000-0000-0000-000000000000/questions"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_create_question_with_options(client, created_quiz):
    quiz_id = created_quiz["id"]
    response = client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "question_text": "Mikä väri on oikeanpuoleisessa viitassa?",
            "position": 1,
            "options": [
                {
                    "option_text": "Vihreä",
                    "is_correct": True,
                    "position": 1,
                },
                {
                    "option_text": "Punainen",
                    "is_correct": False,
                    "position": 2,
                },
            ],
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["quiz_id"] == quiz_id
    assert data["question_text"] == "Mikä väri on oikeanpuoleisessa viitassa?"
    assert data["position"] == 1
    assert len(data["options"]) == 2
    assert data["options"][0]["option_text"] == "Vihreä"
    assert data["options"][0]["is_correct"] is True


def test_nested_options_are_ordered_by_position(client, created_quiz):
    """The nested list used to echo insertion order, unlike GET .../options."""
    quiz_id = created_quiz["id"]
    response = client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "question_text": "Järjestyskysymys",
            "position": 1,
            "options": [
                {"option_text": "Toinen", "position": 2},
                {"option_text": "Ensimmäinen", "position": 1},
            ],
        },
    )

    assert response.status_code == 201

    question_id = response.json()["id"]
    expected = ["Ensimmäinen", "Toinen"]

    def texts(payload):
        return [option["option_text"] for option in payload["options"]]

    assert texts(response.json()) == expected
    assert texts(client.get(f"/quiz-questions/{question_id}").json()) == expected
    assert texts(client.get(f"/quizzes/{quiz_id}/questions").json()[0]) == expected

    dedicated = client.get(f"/quiz-questions/{question_id}/options")
    assert [option["option_text"] for option in dedicated.json()] == expected


def test_nested_questions_are_ordered_by_position(client):
    response = client.post(
        "/quizzes",
        json={
            "name": "järjestetty",
            "questions": [
                {"question_text": "Toinen", "position": 2},
                {"question_text": "Ensimmäinen", "position": 1},
            ],
        },
    )

    assert response.status_code == 201
    assert [
        question["question_text"] for question in response.json()["questions"]
    ] == ["Ensimmäinen", "Toinen"]


def test_create_question_for_missing_quiz_returns_not_found(client):
    response = client.post(
        "/quizzes/00000000-0000-0000-0000-000000000000/questions",
        json={"question_text": "Test question"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_create_question_with_iala_light(client, created_quiz, created_light):
    response = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Mikä valo tämä on?",
            "iala_light_id": created_light["id"],
        },
    )

    assert response.status_code == 201
    assert response.json()["iala_light_id"] == created_light["id"]


def test_create_question_with_missing_iala_light_returns_not_found(client, created_quiz):
    response = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Mikä valo tämä on?",
            "iala_light_id": "00000000-0000-0000-0000-000000000000",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_create_question_with_missing_option_iala_light_returns_not_found(
    client,
    created_quiz,
):
    response = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Mikä valo tämä on?",
            "options": [
                {
                    "option_text": "Vihreä",
                    "iala_light_id": "00000000-0000-0000-0000-000000000000",
                }
            ],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_create_quiz_with_missing_iala_light_returns_not_found(client):
    response = client.post(
        "/quizzes",
        json={
            "name": "test quiz",
            "questions": [
                {
                    "question_text": "Mikä valo tämä on?",
                    "iala_light_id": "00000000-0000-0000-0000-000000000000",
                }
            ],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_get_question(client, created_question):
    response = client.get(f"/quiz-questions/{created_question['id']}")

    assert response.status_code == 200
    assert response.json() == created_question


def test_get_missing_question_returns_not_found(client):
    response = client.get(
        "/quiz-questions/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_update_question(client, created_question):
    response = client.put(
        f"/quiz-questions/{created_question['id']}",
        json={"question_text": "Updated question", "position": 2},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == created_question["id"]
    assert data["quiz_id"] == created_question["quiz_id"]
    assert data["question_text"] == "Updated question"
    assert data["position"] == 2


def test_update_question_preserves_options(client, answerable_question):
    response = client.put(
        f"/quiz-questions/{answerable_question['id']}",
        json={"question_text": "Updated question", "position": 2},
    )

    assert response.status_code == 200
    assert response.json()["options"] == answerable_question["options"]


def test_update_question_keeps_omitted_fields(client, created_quiz, created_light):
    """Omitted fields used to be silently reset to position 0 and a null light."""
    created = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Alkuperäinen",
            "position": 5,
            "iala_light_id": created_light["id"],
        },
    ).json()

    response = client.put(
        f"/quiz-questions/{created['id']}",
        json={"question_text": "Vain teksti vaihtuu"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["question_text"] == "Vain teksti vaihtuu"
    assert data["position"] == 5
    assert data["iala_light_id"] == created_light["id"]
    assert client.get(f"/quiz-questions/{created['id']}").json() == data


def test_update_question_clears_nullable_fields_when_null_is_sent(
    client,
    created_quiz,
    created_light,
):
    created = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Alkuperäinen",
            "position": 5,
            "iala_light_id": created_light["id"],
        },
    ).json()

    response = client.put(
        f"/quiz-questions/{created['id']}",
        json={"question_text": None, "iala_light_id": None},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["question_text"] is None
    assert data["iala_light_id"] is None
    assert data["position"] == 5


def test_update_question_ignores_null_position(client, created_question):
    """position is NOT NULL, so a null must not reach the database."""
    response = client.put(
        f"/quiz-questions/{created_question['id']}",
        json={"position": None},
    )

    assert response.status_code == 200
    assert response.json()["position"] == created_question["position"]


def test_update_question_with_missing_iala_light_returns_not_found(
    client,
    created_question,
):
    response = client.put(
        f"/quiz-questions/{created_question['id']}",
        json={"iala_light_id": "00000000-0000-0000-0000-000000000000"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_update_missing_question_returns_not_found(client):
    response = client.put(
        "/quiz-questions/00000000-0000-0000-0000-000000000000",
        json={"question_text": "Updated question"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_delete_question(client, answerable_question):
    question_id = answerable_question["id"]
    option_id = answerable_question["options"][0]["id"]

    delete_response = client.delete(f"/quiz-questions/{question_id}")
    question_response = client.get(f"/quiz-questions/{question_id}")
    option_response = client.get(f"/quiz-question-options/{option_id}")

    assert delete_response.status_code == 204
    assert question_response.status_code == 404
    assert option_response.status_code == 404


def test_delete_question_deletes_its_responses_but_keeps_the_attempt(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    attempt = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": answerable_question["options"][0]["id"],
                }
            ],
        },
    ).json()

    response_id = attempt["responses"][0]["id"]
    delete_response = client.delete(f"/quiz-questions/{answerable_question['id']}")

    assert delete_response.status_code == 204
    assert client.get(f"/quiz-responses/{response_id}").status_code == 404
    assert client.get(f"/quiz-attempts/{attempt['id']}").status_code == 200


def test_delete_missing_question_returns_not_found(client):
    response = client.delete(
        "/quiz-questions/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"
