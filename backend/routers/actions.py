from fastapi import APIRouter, Depends
from utils import ips_actions
from app import auth

router = APIRouter(prefix='/actions')

@router.post('/kill/{pid}')
def kill(pid: int, current_user=Depends(auth.require_roles(['admin']))):
    ok, msg = ips_actions.kill_process(pid)
    return {'ok': ok, 'msg': msg}

@router.post('/block/ip')
def block_ip(ip: str, current_user=Depends(auth.require_roles(['admin']))):
    ok, msg = ips_actions.add_firewall_block(ip)
    return {'ok': ok, 'msg': msg}

@router.post('/block/port')
def block_port(port: int, current_user=Depends(auth.require_roles(['admin']))):
    ok, msg = ips_actions.add_firewall_block_port(port)
    return {'ok': ok, 'msg': msg}

@router.post('/quarantine')
def quarantine(path: str, current_user=Depends(auth.require_roles(['admin']))):
    ok, msg = ips_actions.quarantine_file(path)
    return {'ok': ok, 'msg': msg}

@router.post('/stop-service')
def stop(service: str, current_user=Depends(auth.require_roles(['admin']))):
    ok, msg = ips_actions.stop_service(service)
    return {'ok': ok, 'msg': msg}
