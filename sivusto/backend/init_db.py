import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg


def init_db():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    conn_url = db_url.replace("postgresql+psycopg://", "postgresql://")
    schema_path = Path(__file__).with_name("schema.sql")

    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    print(f"Connecting to database and executing {schema_path.name}...")
    with psycopg.connect(conn_url) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            cur.execute(schema_sql)
        conn.commit()
    print("Database initialized successfully!")


if __name__ == "__main__":
    init_db()
