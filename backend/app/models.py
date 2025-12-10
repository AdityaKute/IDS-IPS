from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(50), default='member')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ProcessLog(Base):
    __tablename__ = 'process_logs'
    id = Column(Integer, primary_key=True, index=True)
    pid = Column(Integer)
    name = Column(String(256))
    cmdline = Column(Text)
    cpu = Column(Float)
    memory = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50))
    rule = Column(String(256))
    description = Column(Text)
    process_id = Column(Integer, nullable=True)
    metadata = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Rule(Base):
    __tablename__ = 'rules'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), unique=True)
    json = Column(Text)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
