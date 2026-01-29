from app import models
from app.db import get_db
from sqlalchemy.orm import Session
from utils import ips_actions as system_actions

# list of protected process names that should never be killed
CRITICAL_PROCESSES = {'system','svchost.exe','explorer.exe','lsass.exe'}


def perform_action(db: Session, action_name: str, params: dict, actor: str = 'system'):
    """Execute an IPS action and log audit entry. Returns dict with ok and message."""
    # Check mapping: action_name should correspond to a system_action in ips_actions
    # For safety, enforce whitelist of action names
    allowed = {
        'kill_process': system_actions.kill_process,
        'block_ip': system_actions.add_firewall_block,
        'block_port': system_actions.add_firewall_block_port,
        'quarantine_file': system_actions.quarantine_file,
        'stop_service': system_actions.stop_service
    }
    if action_name not in allowed:
        return {'ok': False, 'msg': 'Unknown action'}

    # safety checks
    if action_name == 'kill_process':
        pid = params.get('pid')
        proc_name = params.get('process_name','').lower()
        if proc_name in CRITICAL_PROCESSES:
            return {'ok': False, 'msg': 'Refused: critical process'}
        try:
            ok, msg = allowed[action_name](pid)
        except Exception as e:
            ok, msg = False, str(e)
    elif action_name == 'block_ip':
        ip = params.get('ip')
        ok, msg = allowed[action_name](ip)
    elif action_name == 'block_port':
        port = params.get('port')
        proto = params.get('protocol','TCP')
        ok, msg = allowed[action_name](port, proto)
    elif action_name == 'quarantine_file':
        path = params.get('path')
        ok, msg = allowed[action_name](path)
    elif action_name == 'stop_service':
        svc = params.get('service')
        ok, msg = allowed[action_name](svc)
    else:
        ok, msg = False, 'Unhandled action'

    # audit log
    try:
        entry = models.AuditLog(action_type=action_name, actor=actor, target=str(params or {}), details=params)
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()

    return {'ok': ok, 'msg': msg}
