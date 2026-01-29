from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models

router = APIRouter(prefix="/alerts", tags=["Alerts"])

import logging
logger = logging.getLogger(__name__)

@router.post("/")
def create(alert: schemas.AlertCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    # only authenticated users can create alerts
    a = crud.create_alert(db, alert)
    logger.info('alert.created', extra={'id': a.id, 'agent_id': a.agent_id, 'severity': a.severity})
    # prepare payload for real-time channels
    payload = {
        'id': a.id,
        'agent_id': a.agent_id,
        'rule_id': a.rule_id,
        'title': a.title,
        'description': a.description,
        'severity': a.severity,
        'action_taken': a.action_taken,
        'created_at': a.created_at.isoformat() if a.created_at else None
    }
    # broadcast to websockets and SSE
    try:
        import asyncio
        from app.ws import manager
        loop = asyncio.get_event_loop()
        # schedule broadcasts without blocking
        loop.create_task(manager.broadcast({'type': 'alert', 'payload': payload}))
        loop.create_task(manager.broadcast_sse({'type': 'alert', 'payload': payload}))
    except Exception:
        # do not fail on broadcast errors; alert is persisted
        logger.exception('broadcast.failed')
    return a

@router.get("/")
def list_alerts(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    # return recent alerts (max 100)
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).limit(100).all()
