from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, crud, schemas

router = APIRouter(prefix='/alerts')

@router.get('/')
def get_alerts(db: Session = Depends(db.get_db)):
    return crud.get_alerts(db)

@router.post('/')
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(db.get_db)):
    return crud.create_alert(db, alert)
