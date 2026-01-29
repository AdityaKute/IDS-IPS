import asyncio
import websockets
import os
import json
from .utils import action_executor

async def listen(server_url, api_key=None):
    ws_url = server_url.rstrip('/') + '/realtime/ws/alerts?token=' + (api_key or '')
    # assume ws protocol is ws or wss based on server_url
    ws_url = ws_url.replace('http://','ws://').replace('https://','wss://')
    while True:
        try:
            async with websockets.connect(ws_url) as ws:
                async for msg in ws:
                    try:
                        data = json.loads(msg)
                    except Exception:
                        data = {'raw': msg}
                    # handle action messages
                    if isinstance(data, dict) and data.get('type') == 'action':
                        payload = data.get('payload', {})
                        action = payload.get('action')
                        params = payload.get('params', {})
                        if action == 'kill_process':
                            pid = params.get('pid')
                            action_executor.kill(pid)
                        if action == 'block_ip':
                            ip = params.get('ip')
                            action_executor.block_ip(ip)
                        if action == 'quarantine_file':
                            path = params.get('path')
                            action_executor.quarantine(path)
        except Exception:
            await asyncio.sleep(5)

def start_background(server_url, api_key=None):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(listen(server_url, api_key))
