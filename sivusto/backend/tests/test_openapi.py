from export_openapi import OPENAPI_PATH, render
from main import app


def test_exported_schema_is_up_to_date():
    assert OPENAPI_PATH.read_text(encoding="utf-8") == render(), (
        "Run python export_openapi.py and npm run generate-client"
    )


def test_schema_declares_bearer_auth():
    schema = app.openapi()

    assert schema["components"]["securitySchemes"]["HTTPBearer"] == {
        "type": "http",
        "scheme": "bearer",
    }
    assert schema["paths"]["/users"]["get"]["security"] == [{"HTTPBearer": []}]
    assert "security" not in schema["paths"]["/users"]["post"]
    assert "security" not in schema["paths"]["/auth/login"]["post"]
