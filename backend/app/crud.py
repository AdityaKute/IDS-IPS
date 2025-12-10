from sqlalchemy.orm import Session
from . import models, schemas

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username==username).first()

def create_process_log(db: Session, pl: schemas.ProcessLogCreate):
    obj = models.ProcessLog(**pl.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def create_alert(db: Session, alert: schemas.AlertCreate):
    obj = models.Alert(**alert.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_alerts(db: Session, skip:int=0, limit:int=100):
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()

def get_rules(db: Session):
    return db.query(models.Rule).all()

def upsert_rule(db: Session, name: str, json_text: str, enabled: bool=True):
    rule = db.query(models.Rule).filter(models.Rule.name==name).first()
    if rule:
        rule.json = json_text
        rule.enabled = enabled
    else:
        rule = models.Rule(name=name, json=json_text, enabled=enabled)
        db.add(rule)
    db.commit()
    return rule
