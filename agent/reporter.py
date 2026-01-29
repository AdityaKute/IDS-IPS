import requests
import os

class Reporter:
    def __init__(self, server_url, api_key: str = None):
        self.server = server_url.rstrip('/')
        self.api_key = api_key

    def _headers(self):
        h = {}
        if self.api_key:
            h['x-api-key'] = self.api_key
        return h

    def send_process(self, snapshot):
        try:
            r = requests.post(f'{self.server}/processes/log', json=snapshot, timeout=5, headers=self._headers())
            return r.status_code==200
        except Exception as e:
            return False

    def send_alert(self, alert):
        try:
            r = requests.post(f'{self.server}/alerts/', json=alert, timeout=5, headers=self._headers())
            return r.status_code==200
        except Exception as e:
            return False

    def send_action_request(self, action, payload):
        try:
            r = requests.post(f'{self.server}/actions/{action}', json=payload, timeout=5, headers=self._headers())
            return r.json()
        except Exception as e:
            return {'ok':False,'msg':str(e)}
