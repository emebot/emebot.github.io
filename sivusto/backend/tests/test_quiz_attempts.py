import pytest

MISSING_UUID = "00000000-0000-0000-0000-000000000000"


@pytest.mark.parametrize("method", ["get", "delete"])
def test_attempt_invalid_uuid(client, method):
    response = client.request(
        method.upper(),
        "/quiz-attempts/not-a-valid-uuid",
    )

    assert response.status_code == 422


def test_list_attempts_returns_empty_list(client):
    response = client.get("/quiz-attempts")

    assert response.status_code == 200
    assert response.json() == []


def test_list_attempts_returns_created_attempt(client, created_attempt):
    response = client.get("/quiz-attempts")

    assert response.status_code == 200
    assert response.json() == [created_attempt]


def test_list_attempts_is_ordered_by_creation(client, created_user, created_quiz):
    created_ids = [
        client.post(
            "/quiz-attempts",
            json={"user_id": created_user["id"], "quiz_id": created_quiz["id"]},
        ).json()["id"]
        for _ in range(4)
    ]

    response = client.get("/quiz-attempts")

    assert response.status_code == 200
    assert [attempt["id"] for attempt in response.json()] == created_ids


def test_create_attempt(client, created_user, created_quiz):
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["user_id"] == created_user["id"]
    assert data["quiz_id"] == created_quiz["id"]
    assert data["responses"] == []
    assert "id" in data


def test_create_attempt_with_response(client, created_user, created_quiz, answerable_question):
    option = answerable_question["options"][0]
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": option["id"],
                }
            ],
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert len(data["responses"]) == 1
    assert data["responses"][0]["attempt_id"] == data["id"]
    assert data["responses"][0]["question_id"] == answerable_question["id"]
    assert data["responses"][0]["selected_option_id"] == option["id"]


def test_create_attempt_for_missing_user_returns_not_found(client, created_quiz):
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": MISSING_UUID,
            "quiz_id": created_quiz["id"],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_create_attempt_for_missing_quiz_returns_not_found(client, created_user):
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": MISSING_UUID,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


def test_create_attempt_with_invalid_ids_returns_validation_error(client):
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": "not-a-valid-uuid",
            "quiz_id": "not-a-valid-uuid",
        },
    )

    assert response.status_code == 422


def test_create_attempt_with_missing_question_returns_not_found(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    """These used to reach Postgres and surface as a 500."""
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": MISSING_UUID,
                    "selected_option_id": answerable_question["options"][0]["id"],
                }
            ],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_create_attempt_with_missing_option_returns_not_found(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": MISSING_UUID,
                }
            ],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Option not found"


def test_create_attempt_rejects_option_from_another_question(
    client,
    created_user,
    created_quiz,
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
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": other["options"][0]["id"],
                }
            ],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Selected option does not belong to the question"
    )


def test_create_attempt_rejects_question_from_another_quiz(
    client,
    created_user,
    created_quiz,
):
    other_quiz = client.post("/quizzes", json={"name": "toinen visa"}).json()
    foreign = client.post(
        f"/quizzes/{other_quiz['id']}/questions",
        json={
            "question_text": "Vieras kysymys",
            "options": [{"option_text": "Keltainen", "position": 1}],
        },
    ).json()

    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": foreign["id"],
                    "selected_option_id": foreign["options"][0]["id"],
                }
            ],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Question does not belong to the attempted quiz"
    )


def test_create_attempt_rejects_two_answers_to_the_same_question(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    """The unique index used to surface as a 500 instead of a 409."""
    options = answerable_question["options"]
    response = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": [
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": options[0]["id"],
                },
                {
                    "question_id": answerable_question["id"],
                    "selected_option_id": options[1]["id"],
                },
            ],
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "This question has already been answered in this attempt"
    )
    assert client.get("/quiz-attempts").json() == []


def test_create_attempt_nests_responses_in_a_stable_order(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    """Nested responses share a created_at within the transaction, so the order
    is not insertion order -- but it must be the same on every read."""
    second = client.post(
        f"/quizzes/{created_quiz['id']}/questions",
        json={
            "question_text": "Toinen kysymys",
            "position": 2,
            "options": [{"option_text": "Keltainen", "position": 1}],
        },
    ).json()

    payload = [
        {
            "question_id": answerable_question["id"],
            "selected_option_id": answerable_question["options"][0]["id"],
        },
        {
            "question_id": second["id"],
            "selected_option_id": second["options"][0]["id"],
        },
    ]
    created = client.post(
        "/quiz-attempts",
        json={
            "user_id": created_user["id"],
            "quiz_id": created_quiz["id"],
            "responses": payload,
        },
    )

    assert created.status_code == 201

    attempt_id = created.json()["id"]
    order = [item["id"] for item in created.json()["responses"]]

    assert sorted(item["question_id"] for item in created.json()["responses"]) == sorted(
        item["question_id"] for item in payload
    )

    for _ in range(3):
        fetched = client.get(f"/quiz-attempts/{attempt_id}")
        assert [item["id"] for item in fetched.json()["responses"]] == order

    listed = client.get(f"/quiz-attempts/{attempt_id}/responses")
    assert [item["id"] for item in listed.json()] == order


def test_get_attempt(client, created_attempt):
    response = client.get(f"/quiz-attempts/{created_attempt['id']}")

    assert response.status_code == 200
    assert response.json() == created_attempt


def test_get_missing_attempt_returns_not_found(client):
    response = client.get(f"/quiz-attempts/{MISSING_UUID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Attempt not found"


def test_delete_attempt(client, created_attempt):
    attempt_id = created_attempt["id"]

    delete_response = client.delete(f"/quiz-attempts/{attempt_id}")
    get_response = client.get(f"/quiz-attempts/{attempt_id}")

    assert delete_response.status_code == 204
    assert get_response.status_code == 404


def test_delete_attempt_deletes_its_responses(
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
    delete_response = client.delete(f"/quiz-attempts/{attempt['id']}")

    assert delete_response.status_code == 204
    assert client.get(f"/quiz-responses/{response_id}").status_code == 404
    assert client.get(f"/quiz-questions/{answerable_question['id']}").status_code == 200


def test_delete_missing_attempt_returns_not_found(client):
    response = client.delete(f"/quiz-attempts/{MISSING_UUID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Attempt not found"
