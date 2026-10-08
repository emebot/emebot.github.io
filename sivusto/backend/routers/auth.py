from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from security import create_access_token, password_hasher
import models
import schemas

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(func.lower(models.User.username) == func.lower(credentials.username))
        .first()
    )

    if user is None or not password_hasher.verify(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return schemas.TokenResponse(access_token=create_access_token(user.id))
