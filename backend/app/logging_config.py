import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            'level': record.levelname,
            'msg': record.getMessage(),
            'module': record.module,
            'time': self.formatTime(record, self.datefmt)
        }
        if record.args:
            payload['args'] = record.args
        return json.dumps(payload)


def configure():
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.handlers = []
    root.addHandler(handler)

# auto-configure on import
configure()
