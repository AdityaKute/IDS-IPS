import time
from collections import defaultdict, Counter
import re
from typing import List
from app import models
from app.db import get_db

# Simple tokenization helper
def _tokens(s: str):
    if not s:
        return set()
    s = re.sub(r"[^a-zA-Z0-9_\.@-]", " ", s)
    return set([t.lower() for t in s.split() if len(t) > 1])


def analyze_recent_unrecognized(db=None, lookback_seconds: int = 900):
    """Cluster recent PENDING unrecognized attacks and propose patterns.
    Basic heuristic clustering by process_name + cmdline token overlap.
    This function obtains its own DB session if one is not supplied so it is safe to call from background threads.
    """
    if db is None:
        db = next(get_db())
    cutoff = time.time() - lookback_seconds
    # fetch recent pending unrecognized attacks
    rows = db.query(models.UnrecognizedAttack).filter(models.UnrecognizedAttack.status == 'PENDING').all()
    if not rows:
        return []

    # simple grouping: by process_name first
    groups = defaultdict(list)
    for r in rows:
        t = (r.telemetry or {}).get('process_name') if r.telemetry else None
        key = (t or 'unknown').lower()
        groups[key].append(r)

    proposals = []
    for proc, items in groups.items():
        # further cluster by cmdline tokens
        token_buckets = defaultdict(list)
        for it in items:
            cmd = (it.telemetry or {}).get('cmdline','')
            tok = tuple(sorted(_tokens(cmd)))
            token_buckets[tok].append(it)

        for tok, members in token_buckets.items():
            if len(members) < 1:
                continue
            # build simple pattern: process_name, cmdline_regex constructed from frequent tokens
            proc_name = proc if proc != 'unknown' else None
            if tok:
                # build regex matching tokens in any order
                from .learning_helpers import build_cmdline_regex_from_tokens
                regex = build_cmdline_regex_from_tokens(tok)
            else:
                regex = None

            # compute learning score proportional to members count
            learning_score = float(len(members))
            # create ProposedPattern entry
            pattern_obj = {
                'process_name': proc_name,
                'cmdline_regex': regex,
                'ip_pattern': None,
                'frequency_threshold': len(members)
            }
            prop = models.ProposedPattern(name=f"Auto-{proc_name or 'unknown'}", pattern=pattern_obj, proposed_by='auto-learner', status='PENDING')
            db.add(prop)
            db.commit()
            db.refresh(prop)

            # mark members with cluster id
            cluster_id = f"c-{prop.id}-{int(time.time())}"
            for m in members:
                m.cluster_id = cluster_id
                m.status = 'LEARNING'
                m.learning_score = learning_score
                db.commit()
            # attempt to broadcast proposal for admin UIs (best-effort)
            try:
                import asyncio
                from app.ws import manager
                loop = asyncio.get_event_loop()
                loop.create_task(manager.broadcast({'type': 'proposal', 'payload': {'id': prop.id, 'name': prop.name, 'created_at': prop.created_at.isoformat()}}))
                loop.create_task(manager.broadcast_sse({'type': 'proposal', 'payload': {'id': prop.id, 'name': prop.name, 'created_at': prop.created_at.isoformat()}}))
            except Exception:
                pass
            proposals.append(prop)
    return proposals


def promote_proposal(db, proposal_id: int, admin_email: str):
    """Approve a proposed pattern: create AttackType and AttackPattern and mark proposal APPROVED.
    Returns created AttackPattern
    """
    p = db.query(models.ProposedPattern).filter(models.ProposedPattern.id == proposal_id).first()
    if not p:
        raise ValueError('Proposal not found')
    # create attack type (name derived)
    attack_type = models.AttackType(name=p.name, description=f'Created from proposal {p.id}')
    db.add(attack_type)
    db.commit()
    db.refresh(attack_type)
    # create attack pattern
    pat = models.AttackPattern(attack_type_id=attack_type.id,
                               process_name=p.pattern.get('process_name'),
                               cmdline_regex=p.pattern.get('cmdline_regex'),
                               url_pattern=p.pattern.get('url_pattern'),
                               ip_pattern=p.pattern.get('ip_pattern'),
                               frequency_threshold=p.pattern.get('frequency_threshold') or 0,
                               severity='MEDIUM',
                               recommended_action=None,
                               is_active=True)
    db.add(pat)
    db.commit()
    db.refresh(pat)

    # mark proposal and related unrecognized entries
    p.status = 'APPROVED'
    p.linked_attack_type_id = attack_type.id
    db.commit()

    # update unrecognized entries in same cluster
    for u in db.query(models.UnrecognizedAttack).filter(models.UnrecognizedAttack.cluster_id.like(f"%{p.id}%") ).all():
        u.status = 'CONFIRMED'
        db.commit()

    # audit log
    try:
        entry = models.AuditLog(action_type='proposal.promote', actor=admin_email, target=str({'proposal_id': p.id}), details={'proposal': p.id})
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()

    return pat