from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db import get_db
from app import crud, schemas, auth

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        hashed = auth.get_password_hash(user.password)
    except ValueError as e:
        # password validation (too long etc.)
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        # server-side/bcrypt initialization issue
        raise HTTPException(status_code=500, detail=str(e))

    try:
        obj = crud.create_user(db, user, hashed)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create user (constraint error)")
    except Exception as e:
        # propagate any other predictable issues as 400
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "id": obj.id,
        "email": obj.email,
        "role": obj.role.name if obj.role else None,
        "is_active": obj.is_active,
        "created_at": obj.created_at,
    }

@router.get('/me', response_model=schemas.UserOut)
def me(current_user = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name if current_user.role else None,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }
