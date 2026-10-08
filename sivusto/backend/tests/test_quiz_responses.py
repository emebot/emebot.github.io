import pytest

MISSING_UUID = "00000000-0000-0000-0000-000000000000"


@pytest.fixture
def answer_payload(answerable_question):
    return {
        "question_id": answerable_question["id"],
        "selected_option_id": answerable_question["options"][0]["id"],
    }


@pytest.mark.parametrize("method", ["get", "delete"])
def test_response_invalid_uuid(client, method):
    response = client.request(
        method.upper(),
        "/quiz-responses/not-a-valid-uuid",
    )

    assert response.status_code == 422


def test_list_responses_returns_empty_list(client, created_attempt):
    response = client.get(f"/quiz-attempts/{created_attempt['id']}/responses")

    assert response.status_code == 200
    assert response.json() == []


def test_list_responses_for_missing_attempt_returns_not_found(client):
    response = client.get(f"/quiz-attempts/{MISSING_UUID}/responses")

    assert response.status_code == 404
    assert response.json()["detail"] == "Attempt not found"


def test_create_response(client, created_attempt, answer_payload):
    response = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json=answer_payload,
    )

    assert response.status_code == 201

    data = response.json()
    assert data["attempt_id"] == created_attempt["id"]
    assert data["question_id"] == answer_payload["question_id"]
    assert data["selected_option_id"] == answer_payload["selected_option_id"]
    assert "id" in data


def test_create_response_for_missing_attempt_returns_not_found(client, answer_payload):
    response = client.post(
        f"/quiz-attempts/{MISSING_UUID}/responses",
        json=answer_payload,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Attempt not found"


def test_create_response_for_missing_question_returns_not_found(
    client,
    created_attempt,
    answer_payload,
):
    response = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={**answer_payload, "question_id": MISSING_UUID},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_create_response_for_missing_option_returns_not_found(
    client,
    created_attempt,
    answer_payload,
):
    response = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={**answer_payload, "selected_option_id": MISSING_UUID},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Option not found"


def test_create_response_rejects_option_from_another_question(
    client,
    created_quiz,
    created_attempt,
    answerable_question,
):
    other = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Toinen kysymys",
            "position": 2,
            "options": [{"option_text": "Keltainen", "position": 1}],
        },
    ).json()

    response = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={
            "question_id": answerable_question["id"],
            "selected_option_id": other["options"][0]["id"],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Selected option does not belong to the question"
    )


def test_create_response_rejects_question_from_another_quiz(client, created_attempt):
    other_quiz = client.post("/quizzes", json={"name": "toinen visa"}).json()
    foreign = client.post(
        f"/quizzes/{other_quiz['id']}/questions",
        json={
            "question_text": "Vieras kysymys",
            "options": [{"option_text": "Keltainen", "position": 1}],
        },
    ).json()

    response = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={
            "question_id": foreign["id"],
            "selected_option_id": foreign["options"][0]["id"],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Question does not belong to the attempted quiz"
    )


def test_answering_the_same_question_twice_returns_conflict(
    client,
    created_attempt,
    answerable_question,
):
    first = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={
            "question_id": answerable_question["id"],
            "selected_option_id": answerable_question["options"][0]["id"],
        },
    )
    second = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json={
            "question_id": answerable_question["id"],
            "selected_option_id": answerable_question["options"][1]["id"],
        },
    )

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["detail"] == (
        "This question has already been answered in this attempt"
    )


def test_list_responses_returns_created_responses(
    client,
    created_quiz,
    created_attempt,
    answerable_question,
):
    second = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Toinen kysymys",
            "position": 2,
            "options": [{"option_text": "Keltainen", "position": 1}],
        },
    ).json()

    created = [
        client.post(
            f"/quiz-attempts/{created_attempt['id']}/responses",
            json={
                "question_id": question["id"],
                "selected_option_id": question["options"][0]["id"],
            },
        ).json()["id"]
        for question in (answerable_question, second)
    ]

    response = client.get(f"/quiz-attempts/{created_attempt['id']}/responses")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == created


def test_get_response(client, created_attempt, answer_payload):
    created = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json=answer_payload,
    ).json()

    response = client.get(f"/quiz-responses/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_get_missing_response_returns_not_found(client):
    response = client.get(f"/quiz-responses/{MISSING_UUID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Response not found"


def test_delete_response(client, created_attempt, answer_payload):
    created = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json=answer_payload,
    ).json()

    delete_response = client.delete(f"/quiz-responses/{created['id']}")

    assert delete_response.status_code == 204
    assert client.get(f"/quiz-responses/{created['id']}").status_code == 404
    assert client.get(f"/quiz-attempts/{created_attempt['id']}").status_code == 200


def test_delete_response_frees_the_question_to_be_answered_again(
    client,
    created_attempt,
    answer_payload,
):
    created = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json=answer_payload,
    ).json()

    client.delete(f"/quiz-responses/{created['id']}")
    again = client.post(
        f"/quiz-attempts/{created_attempt['id']}/responses",
        json=answer_payload,
    )

    assert again.status_code == 201


def test_delete_missing_response_returns_not_found(client):
    response = client.delete(f"/quiz-responses/{MISSING_UUID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Response not found"
