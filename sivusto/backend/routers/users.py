# User endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from security import authorize_owner, get_current_user, is_admin, password_hasher
import models
import schemas

router = APIRouter(prefix="/users", tags=["users"])

protected = [Depends(get_current_user)]


@router.get("", response_model=list[schemas.UserResponse], dependencies=protected)
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.username).all()


@router.get("/{user_id}", response_model=schemas.UserResponse, dependencies=protected)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("", status_code=201, response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role == schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not allowed")

    hashed_password = password_hasher.hash(user.password)

    db_user = models.User(
        username=user.username,
        password_hash=hashed_password,
        role=user.role or models.UserRole.USER,
    )

    db.add(db_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Username already exists",
        )

    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=schemas.UserResponse, dependencies=protected)
def update_user(
    user_id: UUID,
    user: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    authorize_owner(current_user, user_id)

    if user.role is not None and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not allowed")

    db_user = db.query(models.User).filter(models.User.id == user_id).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.username is not None:
        db_user.username = user.username

    if user.password is not None:
        db_user.password_hash = password_hasher.hash(user.password)

    if user.role is not None:
        db_user.role = user.role

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Username already exists",
        )

    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", status_code=204, dependencies=protected)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    authorize_owner(current_user, user_id)

    user = db.query(models.User).filter(models.User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return Response(status_code=204)

