from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas

router = APIRouter(prefix="/rules", tags=["Rules"])

@router.post("/")
def upsert(rule: schemas.RuleCreate, db: Session = Depends(get_db)):
    return crud.upsert_rule(db, rule)
