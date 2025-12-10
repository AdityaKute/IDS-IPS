from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, crud, schemas, auth

router = APIRouter(prefix='/users')

@router.post('/register')
def register(user: schemas.UserCreate, db: Session = Depends(db.get_db)):
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail='User exists')
    hashed = auth.get_password_hash(user.password)
    return crud.create_user(db, user, hashed)

@router.get('/me')
def me(current_user = Depends(auth.get_current_user)):
    return current_user
