# Initializing the database and starting the backend

To initialize the database, run:

```
python init_db.py
```

To start the backend, run:

```
python -m uvicorn main:app --env-file .env --reload --host 127.0.0.1 --port 8000
```
