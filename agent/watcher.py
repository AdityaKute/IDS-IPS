import psutil
import time
from threading import Thread

class ProcessWatcher(Thread):
    def __init__(self, interval=2, callback=None):
        super().__init__(daemon=True)
        self.interval = interval
        self.callback = callback

    def run(self):
        while True:
            for p in psutil.process_iter(['pid','name','cmdline','cpu_percent','memory_percent']):
                info = p.info
                snapshot = {
                    'pid': info['pid'],
                    'name': info.get('name'),
                    'cmdline': ' '.join(info.get('cmdline') or []),
                    'cpu': info.get('cpu_percent', 0.0),
                    'memory': info.get('memory_percent', 0.0)
                }
                if self.callback:
                    self.callback(snapshot)
            time.sleep(self.interval)
