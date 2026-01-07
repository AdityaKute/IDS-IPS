from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models

router = APIRouter(prefix="/rules", tags=["Rules"])

@router.post("/")
def upsert(rule: schemas.RuleCreate, db: Session = Depends(get_db), current_user=Depends(auth.require_roles(['admin']))):
    # only admins can create or modify rules
    return crud.upsert_rule(db, rule)

@router.get("/")
def list_rules(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.Rule).order_by(models.Rule.created_at.desc()).all()
