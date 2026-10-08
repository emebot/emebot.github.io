import pytest


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_option_invalid_uuid(client, method):
    response = client.request(
        method.upper(),
        "/quiz-question-options/not-a-valid-uuid",
        json={"option_text": "Punainen"} if method == "put" else None,
    )

    assert response.status_code == 422


def test_list_options_returns_empty_list(client, created_question):
    response = client.get(f"/quiz-questions/{created_question['id']}/options")

    assert response.status_code == 200
    assert response.json() == []


def test_list_options_returns_options_in_position_order(client, created_question):
    question_id = created_question["id"]
    client.post(
        f"/quiz-questions/{question_id}/options",
        json={"option_text": "Vihreä", "position": 2},
    )
    client.post(
        f"/quiz-questions/{question_id}/options",
        json={"option_text": "Punainen", "position": 1},
    )

    response = client.get(f"/quiz-questions/{question_id}/options")

    assert response.status_code == 200
    assert [option["option_text"] for option in response.json()] == [
        "Punainen",
        "Vihreä",
    ]


def test_list_options_for_missing_question_returns_not_found(client):
    response = client.get(
        "/quiz-questions/00000000-0000-0000-0000-000000000000/options"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_create_option(client, created_question):
    question_id = created_question["id"]
    response = client.post(
        f"/quiz-questions/{question_id}/options",
        json={
            "option_text": "Punainen",
            "is_correct": True,
            "position": 1,
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["question_id"] == question_id
    assert data["option_text"] == "Punainen"
    assert data["is_correct"] is True
    assert data["position"] == 1
    assert "id" in data


def test_create_option_for_missing_question_returns_not_found(client):
    response = client.post(
        "/quiz-questions/00000000-0000-0000-0000-000000000000/options",
        json={"option_text": "Punainen"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_create_option_with_iala_light(client, created_question, created_light):
    response = client.post(
        f"/quiz-questions/{created_question['id']}/options",
        json={"option_text": "Vihreä", "iala_light_id": created_light["id"]},
    )

    assert response.status_code == 201
    assert response.json()["iala_light_id"] == created_light["id"]


def test_create_option_with_missing_iala_light_returns_not_found(
    client,
    created_question,
):
    response = client.post(
        f"/quiz-questions/{created_question['id']}/options",
        json={
            "option_text": "Vihreä",
            "iala_light_id": "00000000-0000-0000-0000-000000000000",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_get_option(client, created_option):
    response = client.get(f"/quiz-question-options/{created_option['id']}")

    assert response.status_code == 200
    assert response.json() == created_option


def test_get_missing_option_returns_not_found(client):
    response = client.get(
        "/quiz-question-options/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Option not found"


def test_update_option(client, created_option):
    response = client.put(
        f"/quiz-question-options/{created_option['id']}",
        json={
            "option_text": "Vihreä",
            "is_correct": False,
            "position": 2,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == created_option["id"]
    assert data["question_id"] == created_option["question_id"]
    assert data["option_text"] == "Vihreä"
    assert data["is_correct"] is False
    assert data["position"] == 2


def test_update_option_keeps_omitted_fields(client, created_question, created_light):
    """Omitted fields used to be reset to is_correct=false and position 0."""
    created = client.post(
        f"/quiz-questions/{created_question['id']}/options",
        json={
            "option_text": "Punainen",
            "is_correct": True,
            "position": 3,
            "iala_light_id": created_light["id"],
        },
    ).json()

    response = client.put(
        f"/quiz-question-options/{created['id']}",
        json={"option_text": "Vain teksti vaihtuu"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["option_text"] == "Vain teksti vaihtuu"
    assert data["is_correct"] is True
    assert data["position"] == 3
    assert data["iala_light_id"] == created_light["id"]
    assert client.get(f"/quiz-question-options/{created['id']}").json() == data


def test_update_option_clears_nullable_fields_when_null_is_sent(
    client,
    created_question,
    created_light,
):
    created = client.post(
        f"/quiz-questions/{created_question['id']}/options",
        json={
            "option_text": "Punainen",
            "is_correct": True,
            "position": 3,
            "iala_light_id": created_light["id"],
        },
    ).json()

    response = client.put(
        f"/quiz-question-options/{created['id']}",
        json={"option_text": None, "iala_light_id": None},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["option_text"] is None
    assert data["iala_light_id"] is None
    assert data["is_correct"] is True
    assert data["position"] == 3


def test_update_option_ignores_null_not_null_columns(client, created_option):
    """is_correct and position are NOT NULL, so a null must not reach the database."""
    response = client.put(
        f"/quiz-question-options/{created_option['id']}",
        json={"is_correct": None, "position": None},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["is_correct"] == created_option["is_correct"]
    assert data["position"] == created_option["position"]


def test_update_option_with_missing_iala_light_returns_not_found(client, created_option):
    response = client.put(
        f"/quiz-question-options/{created_option['id']}",
        json={"iala_light_id": "00000000-0000-0000-0000-000000000000"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "IALA light not found"


def test_update_missing_option_returns_not_found(client):
    response = client.put(
        "/quiz-question-options/00000000-0000-0000-0000-000000000000",
        json={"option_text": "Vihreä"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Option not found"


def test_delete_option(client, created_option):
    option_id = created_option["id"]

    delete_response = client.delete(f"/quiz-question-options/{option_id}")
    get_response = client.get(f"/quiz-question-options/{option_id}")

    assert delete_response.status_code == 204
    assert get_response.status_code == 404


def test_delete_option_deletes_responses_that_selected_it(
    client,
    created_user,
    created_quiz,
    answerable_question,
):
    option = answerable_question["options"][0]
    attempt = client.post(
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
    ).json()

    response_id = attempt["responses"][0]["id"]
    delete_response = client.delete(f"/quiz-question-options/{option['id']}")

    assert delete_response.status_code == 204
    assert client.get(f"/quiz-responses/{response_id}").status_code == 404
    assert client.get(f"/quiz-questions/{answerable_question['id']}").status_code == 200


def test_delete_missing_option_returns_not_found(client):
    response = client.delete(
        "/quiz-question-options/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Option not found"
