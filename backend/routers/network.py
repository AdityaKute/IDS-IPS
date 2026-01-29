from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models
import logging

router = APIRouter(prefix="/network", tags=["Network"]) 
logger = logging.getLogger(__name__)

@router.post('/log')
def log_network(ev: schemas.NetworkEventCreate, request: Request = None, db: Session = Depends(get_db)):
    # allow agent auth via X-API-KEY
    api_key = None
    if request is not None:
        api_key = request.headers.get('x-api-key')
    if api_key:
        try:
            from app.auth import get_agent_from_api_key
            agent = get_agent_from_api_key(api_key, db)
            ev.agent_id = agent.id
        except Exception:
            pass
    persisted = crud.create_network_event(db, ev)

    # audit
    try:
        entry = models.AuditLog(action_type='network_event.create', actor='agent', target=str({'agent_id': ev.agent_id}), details=ev.dict())
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()

    # realtime broadcast
    try:
        import asyncio
        from app.ws import manager
        loop = asyncio.get_event_loop()
        payload = {'id': persisted.id, 'agent_id': persisted.agent_id, 'local_ip': persisted.local_ip, 'remote_ip': persisted.remote_ip, 'protocol': persisted.protocol, 'timestamp': persisted.timestamp.isoformat() if persisted.timestamp else None}
        loop.create_task(manager.broadcast({'type': 'network', 'payload': payload}))
        loop.create_task(manager.broadcast_sse({'type': 'network', 'payload': payload}))
    except Exception:
        logger.exception('broadcast.failed')

    return persisted

@router.get('/recent')
def recent(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.NetworkEvent).order_by(models.NetworkEvent.timestamp.desc()).limit(200).all()
