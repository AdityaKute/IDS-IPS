import subprocess
import os
import shutil
import psutil

QUARANTINE_DIR = os.getenv('QUARANTINE_DIR', 'C:\\ids_quarantine')
if not os.path.exists(QUARANTINE_DIR):
    os.makedirs(QUARANTINE_DIR)


def kill_process(pid:int):
    try:
        p = psutil.Process(pid)
        p.terminate()
        return True, 'terminated'
    except Exception as e:
        return False, str(e)


def add_firewall_block(ip:str, name:str='IDS_Block'):
    # Uses netsh to block outbound traffic to IP
    cmd = ['netsh', 'advfirewall', 'firewall', 'add', 'rule', f'name={name}_{ip}', 'dir=out', f'remoteip={ip}', 'action=block']
    try:
        subprocess.check_output(cmd, shell=True)
        return True, 'blocked'
    except subprocess.CalledProcessError as e:
        return False, e.output.decode(errors='ignore')


def add_firewall_block_port(port:int, protocol='TCP', name:str='IDS_BlockPort'):
    cmd = ['netsh', 'advfirewall', 'firewall', 'add', 'rule', f'name={name}_{port}', 'dir=out', f'protocol={protocol}', f'remoteport={port}', 'action=block']
    try:
        subprocess.check_output(cmd, shell=True)
        return True, 'port blocked'
    except subprocess.CalledProcessError as e:
        return False, e.output.decode(errors='ignore')


def quarantine_file(path:str):
    try:
        if os.path.exists(path):
            dest = os.path.join(QUARANTINE_DIR, os.path.basename(path))
            shutil.move(path, dest)
            return True, dest
        return False, 'file not found'
    except Exception as e:
        return False, str(e)


def stop_service(service_name:str):
    cmd = ['sc', 'stop', service_name]
    try:
        subprocess.check_output(cmd, shell=True)
        return True, 'service stopped'
    except subprocess.CalledProcessError as e:
        return False, e.output.decode(errors='ignore')
