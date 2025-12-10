from fastapi import APIRouter, Depends
from ..utils import ips_actions

router = APIRouter(prefix='/actions')

@router.post('/kill/{pid}')
def kill(pid: int):
    ok, msg = ips_actions.kill_process(pid)
    return {'ok': ok, 'msg': msg}

@router.post('/block/ip')
def block_ip(ip: str):
    ok, msg = ips_actions.add_firewall_block(ip)
    return {'ok': ok, 'msg': msg}

@router.post('/block/port')
def block_port(port: int):
    ok, msg = ips_actions.add_firewall_block_port(port)
    return {'ok': ok, 'msg': msg}

@router.post('/quarantine')
def quarantine(path: str):
    ok, msg = ips_actions.quarantine_file(path)
    return {'ok': ok, 'msg': msg}

@router.post('/stop-service')
def stop(service: str):
    ok, msg = ips_actions.stop_service(service)
    return {'ok': ok, 'msg': msg}
