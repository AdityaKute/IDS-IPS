from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("/")
def create(alert: schemas.AlertCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    # only authenticated users can create alerts
    return crud.create_alert(db, alert)

@router.get("/")
def list_alerts(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    # return recent alerts (max 100)
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).limit(100).all()
