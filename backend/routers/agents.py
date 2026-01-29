from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas, auth

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.post('/register')
def register_agent(payload: schemas.AgentRegister, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    # admin-only: create or update agent and return api token
    obj = crud.create_agent(db, payload.dict())
    return {'id': obj.id, 'agent_id': obj.agent_id, 'api_token': obj.api_token}

@router.get('/')
def list_agents(db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    return db.query(auth.models.Agent).all()

@router.get('/me')
def whoami(request: Request, db: Session = Depends(get_db)):
    api_key = request.headers.get('x-api-key')
    if not api_key:
        return {'ok': False, 'msg': 'Missing X-API-KEY header'}
    try:
        agent = auth.get_agent_from_api_key(api_key, db)
        return {'id': agent.id, 'agent_id': agent.agent_id, 'hostname': agent.hostname, 'ip_address': agent.ip_address, 'network_range': agent.network_range}
    except Exception as e:
        return {'ok': False, 'msg': str(e)}
