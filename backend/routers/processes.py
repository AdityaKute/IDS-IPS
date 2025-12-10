from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import db, crud, schemas

router = APIRouter(prefix='/processes')

@router.post('/log')
def log_process(pl: schemas.ProcessLogCreate, db: Session = Depends(db.get_db)):
    return crud.create_process_log(db, pl)

@router.get('/recent')
def recent_processes(db: Session = Depends(db.get_db)):
    return db.query(crud.models.ProcessLog).order_by(crud.models.ProcessLog.timestamp.desc()).limit(100).all()
