# App initialization, dependency injection setup

import os

from fastapi import Depends, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DataError
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    users,
    quizzes,
    quiz_questions,
    quiz_question_options,
    quiz_attempts,
    quiz_responses,
    iala_lights_router,
)
from security import get_current_user

app = FastAPI(generate_unique_id_function=lambda route: route.name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

protected = [Depends(get_current_user)]

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(quizzes.router, dependencies=protected)
app.include_router(quiz_questions.router, dependencies=protected)
app.include_router(quiz_question_options.router, dependencies=protected)
app.include_router(quiz_attempts.router, dependencies=protected)
app.include_router(quiz_responses.router, dependencies=protected)
app.include_router(iala_lights_router.router, prefix="/iala-lights", dependencies=protected)


# Postgres still rejects what the schemas do not bound, such as NUL bytes.
@app.exception_handler(DataError)
def reject_invalid_data(request, exc):
    return JSONResponse(status_code=422, content={"detail": "Invalid data"})
