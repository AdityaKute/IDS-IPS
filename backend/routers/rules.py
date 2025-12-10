from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, crud, schemas

router = APIRouter(prefix='/rules')

@router.get('/')
def list_rules(db: Session = Depends(db.get_db)):
    return crud.get_rules(db)

@router.post('/upsert')
def upsert_rule(r: schemas.RuleCreate, db: Session = Depends(db.get_db)):
    return crud.upsert_rule(db, r.name, r.json, r.enabled)
