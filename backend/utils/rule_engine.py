import json
from datetime import datetime

# Simple rule engine: rules are JSON objects saved in DB or rules.json.
# Example rule:
# {"name":"High CPU","type":"cpu_spike","threshold":80}


def evaluate_rules(rules, process_snapshot):
    """rules: list of dicts, process_snapshot: dict with pid,name,cpu,memory,cmdline"""
    alerts = []
    for r in rules:
        if not r.get('enabled', True):
            continue
        t = r.get('type')
        if t == 'cpu_spike':
            if process_snapshot.get('cpu',0) >= r.get('threshold',90):
                alerts.append({'rule':r.get('name'),'level':'critical','desc':f"CPU {process_snapshot.get('cpu')} >= {r.get('threshold')}", 'process_id':process_snapshot.get('pid')})
        if t == 'memory_spike':
            if process_snapshot.get('memory',0) >= r.get('threshold',90):
                alerts.append({'rule':r.get('name'),'level':'high','desc':f"Memory {process_snapshot.get('memory')} >= {r.get('threshold')}", 'process_id':process_snapshot.get('pid')})
        if t == 'suspicious_cmd':
            for pattern in r.get('patterns',[]):
                if pattern.lower() in (process_snapshot.get('cmdline') or '').lower():
                    alerts.append({'rule':r.get('name'),'level':'high','desc':f"cmdline matched {pattern}", 'process_id':process_snapshot.get('pid')})
        if t == 'unsigned_exe':
            # Placeholder: check digital signature of exe path
            pass
        if t == 'file_activity':
            # For file-based alerts the watcher will generate file events that rules evaluate
            pass
    return alerts
