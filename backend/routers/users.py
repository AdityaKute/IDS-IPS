from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed = auth.get_password_hash(user.password)
    return crud.create_user(db, user, hashed)

@router.get('/me')
def me(current_user = Depends(auth.get_current_user)):
    return current_user
