from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.post("/log")
def log_process(ev: schemas.ProcessEventCreate, db: Session = Depends(get_db)):
    return crud.create_process_event(db, ev)

@router.get("/recent")
def recent(db: Session = Depends(get_db)):
    return db.query(crud.models.ProcessEvent).limit(100).all()
