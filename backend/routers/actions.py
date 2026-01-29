from fastapi import APIRouter, Depends, Request, HTTPException
from utils import ips_actions
from app import auth
from app.db import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix='/actions')

from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')


def _actor_from_request(request: Request, db: Session):
    # allow agent via X-API-KEY
    api_key = request.headers.get('x-api-key')
    if api_key:
        try:
            return auth.get_agent_from_api_key(api_key, db)
        except Exception:
            raise HTTPException(status_code=401, detail='Invalid API key')
    # else require Authorization Bearer <token> and Admin role
    auth_header = request.headers.get('authorization')
    if not auth_header or not auth_header.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='Missing credentials')
    token = auth_header.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get('sub')
        if not email:
            raise HTTPException(status_code=401, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid token')
    user = db.query(auth.models.User).filter(auth.models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail='Invalid user')
    role_name = getattr(getattr(user, 'role', None), 'name', None)
    if role_name != 'Admin':
        raise HTTPException(status_code=403, detail='Forbidden: Admin role required')
    return user

@router.post('/kill/{pid}')
def kill(pid: int, request: Request, db: Session = Depends(get_db)):
    actor = _actor_from_request(request, db)
    ok, msg = ips_actions.kill_process(pid)
    return {'ok': ok, 'msg': msg}

@router.post('/block/ip')
def block_ip(ip: str, request: Request, db: Session = Depends(get_db)):
    actor = _actor_from_request(request, db)
    ok, msg = ips_actions.add_firewall_block(ip)
    return {'ok': ok, 'msg': msg}

@router.post('/block/port')
def block_port(port: int, request: Request, db: Session = Depends(get_db)):
    actor = _actor_from_request(request, db)
    ok, msg = ips_actions.add_firewall_block_port(port)
    return {'ok': ok, 'msg': msg}

@router.post('/quarantine')
def quarantine(path: str, request: Request, db: Session = Depends(get_db)):
    actor = _actor_from_request(request, db)
    ok, msg = ips_actions.quarantine_file(path)
    return {'ok': ok, 'msg': msg}

@router.post('/stop-service')
def stop(service: str, request: Request, db: Session = Depends(get_db)):
    actor = _actor_from_request(request, db)
    ok, msg = ips_actions.stop_service(service)
    return {'ok': ok, 'msg': msg}
