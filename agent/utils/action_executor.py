# Local actions: run netsh, move files, stop services
import subprocess
import os
import shutil
import psutil

QUARANTINE_DIR = os.getenv('QUARANTINE_DIR', 'C:\\ids_quarantine')
if not os.path.exists(QUARANTINE_DIR):
    os.makedirs(QUARANTINE_DIR)


def kill(pid:int):
    try:
        p = psutil.Process(pid)
        p.terminate()
        return True, 'terminated'
    except Exception as e:
        return False, str(e)


def block_ip(ip:str):
    cmd = f'netsh advfirewall firewall add rule name="IDS_Block_{ip}" dir=out remoteip={ip} action=block'
    return subprocess.call(cmd, shell=True)


def quarantine(path:str):
    try:
        if os.path.exists(path):
            dest = os.path.join(QUARANTINE_DIR, os.path.basename(path))
            shutil.move(path, dest)
            return True, dest
        return False, 'file not found'
    except Exception as e:
        return False, str(e)
