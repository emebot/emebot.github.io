import re
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from main import app
from security import JWT_ALGORITHM, JWT_SECRET

PUBLIC_ROUTES = {("POST", "/auth/login"), ("POST", "/users")}
MISSING_ID = "00000000-0000-0000-0000-000000000000"

PROTECTED_ROUTES = sorted(
    (method.upper(), path)
    for path, operations in app.openapi()["paths"].items()
    for method in operations
    if (method.upper(), path) not in PUBLIC_ROUTES
)


def register(client, username="alice", password="secret123"):
    response = client.post(
        "/users",
        json={"username": username, "password": password},
    )
    assert response.status_code == 201
    return response.json()


def login(client, username="alice", password="secret123"):
    return client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def test_login_returns_token(anon_client):
    register(anon_client)

    response = login(anon_client)

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_with_wrong_password_returns_unauthorized(anon_client):
    register(anon_client)

    response = login(anon_client, password="wrong")

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_with_unknown_user_returns_unauthorized(anon_client):
    response = login(anon_client)

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_protected_routes_exist():
    assert ("GET", "/users") in PROTECTED_ROUTES
    assert ("GET", "/quizzes") in PROTECTED_ROUTES
    assert ("GET", "/iala-lights") in PROTECTED_ROUTES


@pytest.mark.parametrize("method,path", PROTECTED_ROUTES)
def test_protected_route_without_token_returns_unauthorized(anon_client, method, path):
    url = re.sub(r"\{[^}]+\}", MISSING_ID, path)

    response = anon_client.request(method, url)

    assert response.status_code == 401


def test_protected_route_with_token(anon_client):
    register(anon_client)
    token = login(anon_client).json()["access_token"]

    response = anon_client.get("/users", headers=bearer(token))

    assert response.status_code == 200
    assert [user["username"] for user in response.json()] == ["alice"]


def test_malformed_token_returns_unauthorized(anon_client):
    response = anon_client.get("/users", headers=bearer("not-a-token"))

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


def test_token_signed_with_other_secret_returns_unauthorized(anon_client):
    user = register(anon_client)
    token = jwt.encode(
        {
            "sub": user["id"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        "some-other-secret-that-is-at-least-32-bytes",
        algorithm=JWT_ALGORITHM,
    )

    response = anon_client.get("/users", headers=bearer(token))

    assert response.status_code == 401


def test_expired_token_returns_unauthorized(anon_client):
    user = register(anon_client)
    token = jwt.encode(
        {
            "sub": user["id"],
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    response = anon_client.get("/users", headers=bearer(token))

    assert response.status_code == 401


def test_token_of_deleted_user_returns_unauthorized(anon_client):
    user = register(anon_client)
    token = login(anon_client).json()["access_token"]

    delete_response = anon_client.delete(f"/users/{user['id']}", headers=bearer(token))
    response = anon_client.get("/users", headers=bearer(token))

    assert delete_response.status_code == 204
    assert response.status_code == 401
