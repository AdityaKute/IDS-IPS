from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth, models

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.post("/log")
def log_process(ev: schemas.ProcessEventCreate, db: Session = Depends(get_db), request=None):
    # Accept process logs from agents using X-API-KEY header or from authenticated users.
    api_key = None
    if request is not None:
        api_key = request.headers.get('x-api-key')
    if api_key:
        try:
            from app.auth import get_agent_from_api_key
            agent = get_agent_from_api_key(api_key, db)
            # ensure the incoming event's agent_id matches registered agent id
            ev.agent_id = agent.id
        except Exception:
            # invalid api key; ignore and proceed (do not crash)
            pass

    # persist event
    persisted = crud.create_process_event(db, ev)

    # Evaluate detection rules and trigger actions/alerts
    try:
        import logging
        logger = logging.getLogger(__name__)
        from app.utils.detection import evaluate_process_event
        from app.ips_engine import perform_action
        from app import crud as app_crud
        from app.utils.learning import analyze_recent_unrecognized

        detections = evaluate_process_event(db, ev.dict())

        if detections:
            for d in detections:
                logger.info('detection.matched', extra={'attack_type': d.get('attack_type'), 'pattern_id': d.get('pattern_id'), 'agent_id': ev.agent_id})
                # build alert
                alert_payload = schemas.AlertCreate(
                    agent_id=ev.agent_id,
                    rule_id=None,
                    title=f"Detected {d.get('attack_type')}",
                    description=str(d.get('metadata')),
                    severity=d.get('severity')
                )
                a = app_crud.create_alert(db, alert_payload)
                # broadcast via realtime manager
                try:
                    import asyncio
                    from app.ws import manager
                    loop = asyncio.get_event_loop()
                    payload = {
                        'id': a.id,
                        'agent_id': a.agent_id,
                        'title': a.title,
                        'description': a.description,
                        'severity': a.severity,
                        'created_at': a.created_at.isoformat() if a.created_at else None
                    }
                    loop.create_task(manager.broadcast({'type': 'alert', 'payload': payload}))
                    loop.create_task(manager.broadcast_sse({'type': 'alert', 'payload': payload}))
                except Exception:
                    logger.exception('broadcast.failed')

                # perform recommended action (non-blocking)
                if d.get('recommended_action'):
                    try:
                        # recommended_action is expected e.g. 'kill_process' or 'block_ip'
                        action_spec = d.get('recommended_action')
                        params = d.get('metadata') or {}
                        # schedule in background
                        import threading
                        t = threading.Thread(target=perform_action, args=(db, action_spec, params, 'detection_engine'))
                        t.daemon = True
                        t.start()
                    except Exception:
                        logger.exception('action.perform.failed')
        else:
            # No detections matched: persist as UnrecognizedAttack and schedule learning
            try:
                from app import models as app_models
                ur = app_models.UnrecognizedAttack(agent_id=ev.agent_id, telemetry=ev.dict(), assigned_severity=_heuristic_severity(ev.dict()))
                db.add(ur)
                db.commit()
                db.refresh(ur)
                logger.info('unrecognized.created', extra={'id': ur.id, 'agent_id': ur.agent_id})
                # audit log
                try:
                    entry = models.AuditLog(action_type='unrecognized.create', actor='agent', target=str({'unrecognized_id': ur.id}), details=ur.telemetry)
                    db.add(entry)
                    db.commit()
                except Exception:
                    db.rollback()
                # broadcast unrecognized event
                try:
                    import asyncio
                    from app.ws import manager
                    loop = asyncio.get_event_loop()
                    payload = {'id': ur.id, 'agent_id': ur.agent_id, 'assigned_severity': ur.assigned_severity, 'created_at': ur.created_at.isoformat()}
                    loop.create_task(manager.broadcast({'type': 'unrecognized', 'payload': payload}))
                    loop.create_task(manager.broadcast_sse({'type': 'unrecognized', 'payload': payload}))
                except Exception:
                    logger.exception('broadcast.failed')
                # schedule learning in background
                import threading
                t = threading.Thread(target=analyze_recent_unrecognized, args=(db,))
                t.daemon = True
                t.start()
            except Exception:
                logger.exception('unrecognized.persist.failed')
    except Exception:
        # Do not crash on detection errors
        pass

# helper heuristic severity
def _heuristic_severity(ev_dict):
    # Simple heuristics: suspicious cmdlines or high cpu/memory raise severity
    cmd = (ev_dict.get('cmdline') or ev_dict.get('command_line') or '')
    cmd = str(cmd).lower()
    cpu = ev_dict.get('cpu', ev_dict.get('cpu_usage', 0)) or 0
    mem = ev_dict.get('memory', ev_dict.get('memory_usage', 0)) or 0
    suspicious_tokens = ('powershell', 'rundll32', 'mimikatz', 'nc.exe', 'netcat', 'wmic', 'wscript')
    if any(k in cmd for k in suspicious_tokens):
        return 'HIGH'
    if cpu and cpu > 80:
        return 'HIGH'
    if mem and mem > 80:
        return 'HIGH'
    if any(k in cmd for k in ('curl', 'wget', 'powershell -enc', 'base64')):
        return 'MEDIUM'
    return 'LOW'

@router.get("/recent")
def recent(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.ProcessEvent).order_by(models.ProcessEvent.timestamp.desc()).limit(100).all()
