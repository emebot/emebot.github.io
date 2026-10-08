def test_create_user(client):
    response = client.post(
        "/users",
        json={
            "username": "alice",
            "password": "secret123",
            "role": "user",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["username"] == "alice"
    assert data["role"] == "user"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_create_user_uses_user_role_by_default(client):
    response = client.post(
        "/users",
        json={
            "username": "alice",
            "password": "secret123",
        },
    )

    assert response.status_code == 201
    assert response.json()["role"] == "user"


def test_create_duplicate_user_returns_conflict(client):
    payload = {
        "username": "alice",
        "password": "secret123",
    }

    first_response = client.post("/users", json=payload)
    second_response = client.post("/users", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Username already exists"


def test_list_users_returns_users_sorted_by_username(client):
    client.post(
        "/users",
        json={"username": "zeta", "password": "secret123"},
    )
    client.post(
        "/users",
        json={"username": "alpha", "password": "secret123"},
    )

    response = client.get("/users")

    assert response.status_code == 200

    usernames = [user["username"] for user in response.json()]
    assert usernames == ["alpha", "zeta"]


def test_get_user(client):
    create_response = client.post(
        "/users",
        json={"username": "alice", "password": "secret123"},
    )

    assert create_response.status_code == 201
    user_id = create_response.json()["id"]
    response = client.get(f"/users/{user_id}")

    assert response.status_code == 200
    assert response.json()["username"] == "alice"


def test_get_missing_user_returns_not_found(client):
    response = client.get(
        "/users/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_update_user(client):
    create_response = client.post(
        "/users",
        json={"username": "alice", "password": "old-password"},
    )

    user_id = create_response.json()["id"]

    response = client.put(
        f"/users/{user_id}",
        json={
            "username": "alice-updated",
            "password": "new-password",
            "role": "admin",
        },
    )

    assert response.status_code == 200
    assert response.json()["username"] == "alice-updated"
    assert response.json()["role"] == "admin"


def test_delete_user(client):
    create_response = client.post(
        "/users",
        json={"username": "alice", "password": "secret123"},
    )

    user_id = create_response.json()["id"]

    delete_response = client.delete(f"/users/{user_id}")
    get_response = client.get(f"/users/{user_id}")

    assert delete_response.status_code == 204
    assert get_response.status_code == 404