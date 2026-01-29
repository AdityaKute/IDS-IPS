from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import auth, models

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"]) 

@router.get('/')
def list_audit_logs(db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(500).all()
