from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.post("/log")
def log_process(ev: schemas.ProcessEventCreate, db: Session = Depends(get_db)):
    return crud.create_process_event(db, ev)

@router.get("/recent")
def recent(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.ProcessEvent).order_by(models.ProcessEvent.timestamp.desc()).limit(100).all()
