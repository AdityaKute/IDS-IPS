from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import auth, models, crud, schemas

router = APIRouter(prefix='/attack-intel', tags=['Attack Intelligence'])

@router.post('/types')
def create_attack_type(pt: schemas.AttackTypeCreate, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    existing = db.query(models.AttackType).filter(models.AttackType.name == pt.name).first()
    if existing:
        raise HTTPException(status_code=400, detail='Attack type already exists')
    obj = models.AttackType(name=pt.name, description=pt.description)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get('/types')
def list_attack_types(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.AttackType).all()

@router.post('/patterns')
def create_pattern(p: schemas.AttackPatternCreate, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    obj = models.AttackPattern(**p.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get('/patterns')
def list_patterns(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return db.query(models.AttackPattern).filter(models.AttackPattern.is_active == True).all()

@router.patch('/patterns/{pid}')
def update_pattern(pid: int, p: schemas.AttackPatternCreate, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    obj = db.query(models.AttackPattern).filter(models.AttackPattern.id == pid).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Not found')
    for k,v in p.dict().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete('/patterns/{pid}')
def delete_pattern(pid: int, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    obj = db.query(models.AttackPattern).filter(models.AttackPattern.id == pid).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Not found')
    obj.is_active = False
    db.commit()
    return {'ok': True}

# Unrecognized attacks & learning endpoints
@router.get('/unrecognized')
def list_unrecognized(db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    return db.query(models.UnrecognizedAttack).order_by(models.UnrecognizedAttack.created_at.desc()).limit(200).all()

@router.post('/unrecognized/{uid}/propose')
def propose_from_unrecognized(uid: int, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    u = db.query(models.UnrecognizedAttack).filter(models.UnrecognizedAttack.id == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail='Not found')
    # simple proposal derived from telemetry
    tel = u.telemetry or {}
    pattern = {
        'process_name': tel.get('process_name'),
        'cmdline_regex': None,
        'ip_pattern': tel.get('remote_ip') or tel.get('ip')
    }
    prop = models.ProposedPattern(name=f"Proposal-from-{uid}", pattern=pattern, proposed_by='admin', status='PENDING')
    db.add(prop)
    db.commit()
    db.refresh(prop)
    # mark unrecognized as UNDER_REVIEW
    u.status = 'UNDER_REVIEW'
    db.commit()
    return prop

@router.get('/proposals')
def list_proposals(db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    return db.query(models.ProposedPattern).order_by(models.ProposedPattern.created_at.desc()).limit(200).all()

@router.post('/proposals/{pid}/approve')
def approve_proposal(pid: int, db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    try:
        from app.utils.learning import promote_proposal
        pat = promote_proposal(db, pid, getattr(admin, 'email', 'admin'))
        return pat
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/learning/run')
def run_learning(db: Session = Depends(get_db), admin=Depends(auth.require_roles(['Admin']))):
    # manually trigger analysis
    from app.utils.learning import analyze_recent_unrecognized
    props = analyze_recent_unrecognized(db)
    return {'proposals_created': len(props)}
