from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("/")
def create(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    return crud.create_alert(db, alert)
