import re
import time
from collections import defaultdict, deque
from typing import Dict, Any, List
from app import models
from app.db import get_db

# In-memory state: pattern -> deque of timestamps per agent
_event_windows: Dict[str, Dict[int, deque]] = defaultdict(lambda: defaultdict(deque))
_last_triggered: Dict[str, Dict[int, float]] = defaultdict(lambda: defaultdict(float))

# default cooldown seconds to prevent duplicate actions
DEFAULT_COOLDOWN = 30


def evaluate_process_event(db, process_event: Dict[str, Any]):
    """Evaluate a process event against AttackPattern rules stored in DB.
    Returns list of detection dicts with attack_type, pattern_id, severity, recommended_action, metadata
    """
    results = []
    patterns = db.query(models.AttackPattern).filter(models.AttackPattern.is_active == True).all()
    agent_id = process_event.get('agent_id')

    for p in patterns:
        # match process_name if set
        if p.process_name and p.process_name.lower() != (process_event.get('process_name') or '').lower():
            continue
        # match cmdline regex if set
        if p.cmdline_regex:
            try:
                if not re.search(p.cmdline_regex, process_event.get('cmdline','') or ''):
                    continue
            except re.error:
                # invalid regex; skip pattern
                continue
        # frequency threshold check
        if p.frequency_threshold and p.frequency_threshold > 0:
            deq = _event_windows[str(p.id)][agent_id]
            now = time.time()
            deq.append(now)
            # remove old entries older than window (we use 60 seconds multiplier * threshold as basic heur)
            while deq and deq[0] < now - 60:
                deq.popleft()
            if len(deq) < p.frequency_threshold:
                # not yet reached threshold
                continue
        # check cooldown to make actions idempotent
        last = _last_triggered[str(p.id)].get(agent_id, 0)
        if time.time() - last < DEFAULT_COOLDOWN:
            continue
        _last_triggered[str(p.id)][agent_id] = time.time()

        # build result
        atype = db.query(models.AttackType).filter(models.AttackType.id == p.attack_type_id).first()
        results.append({
            'attack_type': atype.name if atype else 'unknown',
            'pattern_id': p.id,
            'severity': p.severity,
            'recommended_action': p.recommended_action,
            'metadata': {
                'process_name': process_event.get('process_name'),
                'pid': process_event.get('pid'),
                'agent_id': agent_id
            }
        })
    return results
