import json
import os
from pathlib import Path

os.environ.setdefault("JWT_SECRET", "unused")

from main import app

OPENAPI_PATH = Path(__file__).with_name("openapi.json")


def render() -> str:
    return json.dumps(app.openapi(), indent=2) + "\n"


if __name__ == "__main__":
    OPENAPI_PATH.write_text(render(), encoding="utf-8")
