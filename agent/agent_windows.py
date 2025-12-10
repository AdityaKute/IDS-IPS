import argparse
import json
import time
from watcher import ProcessWatcher
from reporter import Reporter
from utils import rule_eval, action_executor

# Simple architecture: agent watches processes, evaluates rules locally, reports logs and requests actions

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--server', required=True, help='Backend server url, e.g. http://127.0.0.1:8000')
    parser.add_argument('--interval', type=int, default=2)
    args = parser.parse_args()

    rep = Reporter(args.server)
    rules = json.load(open('rules.json'))

    def on_snapshot(snapshot):
        # Report log
        try:
            rep.send_process(snapshot)
        except:
            pass
        # Evaluate local rules
        alerts = rule_eval.evaluate_rules(rules, snapshot)
        for a in alerts:
            rep.send_alert({
                'level': a['level'],
                'rule': a['rule'],
                'description': a['desc'],
                'process_id': a.get('process_id'),
                'metadata': json.dumps(snapshot)
            })
            # Automated response based on severity
            if a['level'] in ('critical','high'):
                # request kill
                try:
                    res = rep.send_action_request('kill/'+str(a.get('process_id')), {})
                except Exception as e:
                    pass

    watcher = ProcessWatcher(interval=args.interval, callback=on_snapshot)
    watcher.start()

    # Keep running
    while True:
        time.sleep(1)
