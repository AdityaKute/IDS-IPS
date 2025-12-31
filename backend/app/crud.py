from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    # find role by case-insensitive name, fallback to 'Viewer' role or create it
    role_name = (user.role or "Viewer").strip()
    role_obj = db.query(models.Role).filter(func.lower(models.Role.name) == role_name.lower()).first()

    if not role_obj:
        # fallback to Viewer role
        role_obj = db.query(models.Role).filter(func.lower(models.Role.name) == 'viewer').first()
    if not role_obj:
        # create a default Viewer role if it doesn't exist
        role_obj = models.Role(name='Viewer', description='default viewer role')
        db.add(role_obj)
        db.commit()
        db.refresh(role_obj)

    obj = models.User(
        email=user.email,
        password_hash=hashed_password,
        role_id=role_obj.id
    )
    db.add(obj)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(obj)
    return obj

def create_process_event(db: Session, ev: schemas.ProcessEventCreate):
    obj = models.ProcessEvent(**ev.dict())
    db.add(obj)
    db.commit()
    return obj

def create_network_event(db: Session, ev: schemas.NetworkEventCreate):
    obj = models.NetworkEvent(**ev.dict())
    db.add(obj)
    db.commit()
    return obj

def create_file_event(db: Session, ev: schemas.FileEventCreate):
    obj = models.FileEvent(**ev.dict())
    db.add(obj)
    db.commit()
    return obj

def create_alert(db: Session, alert: schemas.AlertCreate):
    obj = models.Alert(**alert.dict())
    db.add(obj)
    db.commit()
    return obj

def upsert_rule(db: Session, rule: schemas.RuleCreate):
    existing = db.query(models.Rule).filter(models.Rule.name == rule.name).first()
    payload = {
        "name": rule.name,
        "rule_type": rule.rule_type,
        "condition": rule.condition,
        "action": rule.action,
        "severity": rule.severity,
        "is_active": rule.is_active
    }
    if existing:
        for k, v in payload.items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        obj = models.Rule(**payload)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
