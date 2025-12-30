from sqlalchemy.orm import Session
from app import models, schemas

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    obj = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(obj)
    db.commit()
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
    if existing:
        existing.json = rule.json
        existing.enabled = rule.enabled
    else:
        db.add(models.Rule(**rule.dict()))
    db.commit()
