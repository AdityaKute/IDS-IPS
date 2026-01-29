"""
Enhanced threat detection and response router.
Provides APIs for:
- Retrieving threat statistics
- Automated response actions
- Manual threat assessments
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app import auth, models
from datetime import datetime, timedelta

router = APIRouter(prefix="/threats", tags=["Threats"])


@router.get("/statistics")
def threat_statistics(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Get threat statistics for the past 24 hours."""
    last_24h = datetime.utcnow() - timedelta(hours=24)
    
    # Count alerts by severity
    severity_stats = db.query(
        models.Alert.severity,
        func.count(models.Alert.id).label('count')
    ).filter(models.Alert.created_at >= last_24h).group_by(models.Alert.severity).all()
    
    # Total unrecognized threats
    unrecognized_count = db.query(func.count(models.UnrecognizedAttack.id)).filter(
        models.UnrecognizedAttack.created_at >= last_24h
    ).scalar()
    
    # Top attack types in last 24h
    top_attacks = db.query(
        models.AttackType.name,
        func.count(models.Alert.id).label('count')
    ).outerjoin(
        models.AttackPattern, models.AttackPattern.attack_type_id == models.AttackType.id
    ).outerjoin(
        models.Alert, models.Alert.rule_id == models.AttackPattern.id
    ).filter(models.Alert.created_at >= last_24h).group_by(
        models.AttackType.name
    ).order_by(func.count(models.Alert.id).desc()).limit(5).all()
    
    return {
        'timestamp': datetime.utcnow().isoformat(),
        'period': '24_hours',
        'severity_distribution': [{'severity': s, 'count': c} for s, c in severity_stats],
        'total_alerts': sum(c for _, c in severity_stats),
        'unrecognized_threats': unrecognized_count,
        'top_attack_types': [{'type': name, 'count': count} for name, count in top_attacks]
    }


@router.get("/active")
def active_threats(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Get list of active/unresolved threats (high/critical severity from last 24h)."""
    last_24h = datetime.utcnow() - timedelta(hours=24)
    
    threats = db.query(models.Alert).filter(
        models.Alert.created_at >= last_24h,
        models.Alert.severity.in_(['HIGH', 'CRITICAL'])
    ).order_by(models.Alert.created_at.desc()).limit(50).all()
    
    return [{
        'id': t.id,
        'agent_id': t.agent_id,
        'title': t.title,
        'description': t.description,
        'severity': t.severity,
        'action_taken': t.action_taken,
        'created_at': t.created_at.isoformat() if t.created_at else None
    } for t in threats]


@router.get("/trending")
def trending_threats(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Get trending attack types - which are increasing in frequency."""
    # Compare last 24h with 24h before that
    now = datetime.utcnow()
    yesterday = now - timedelta(hours=24)
    two_days_ago = now - timedelta(hours=48)
    
    # Recent period (last 24h)
    recent = db.query(
        models.AttackType.name,
        func.count(models.Alert.id).label('count')
    ).join(
        models.AttackPattern, models.AttackPattern.attack_type_id == models.AttackType.id
    ).join(
        models.Alert, models.Alert.rule_id == models.AttackPattern.id
    ).filter(
        models.Alert.created_at >= yesterday
    ).group_by(models.AttackType.name).all()
    
    # Previous period
    previous = db.query(
        models.AttackType.name,
        func.count(models.Alert.id).label('count')
    ).join(
        models.AttackPattern, models.AttackPattern.attack_type_id == models.AttackType.id
    ).join(
        models.Alert, models.Alert.rule_id == models.AttackPattern.id
    ).filter(
        models.Alert.created_at < yesterday,
        models.Alert.created_at >= two_days_ago
    ).group_by(models.AttackType.name).all()
    
    recent_dict = {name: count for name, count in recent}
    previous_dict = {name: count for name, count in previous}
    
    trending = []
    for name, recent_count in recent_dict.items():
        prev_count = previous_dict.get(name, 0)
        if recent_count > prev_count:
            trending.append({
                'type': name,
                'recent_count': recent_count,
                'previous_count': prev_count,
                'trend': 'increasing'
            })
    
    return sorted(trending, key=lambda x: x['recent_count'] - x['previous_count'], reverse=True)


@router.post("/respond/{alert_id}")
def respond_to_threat(
    alert_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_roles(['Admin']))
):
    """Admin-initiated threat response action."""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail='Alert not found')
    
    # Perform action
    from app.ips_engine import perform_action
    from app import crud
    
    # Get metadata from alert description
    import json
    try:
        metadata = json.loads(alert.description) if alert.description else {}
    except:
        metadata = {}
    
    params = {**metadata, 'agent_id': alert.agent_id}
    result = perform_action(db, action, params, actor=current_user.email)
    
    # Update alert
    alert.action_taken = action
    db.commit()
    
    return {
        'alert_id': alert_id,
        'action': action,
        'result': result
    }
