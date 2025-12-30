from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True)
    hashed_password = Column(String(255))
    role = Column(String(50), default="member")
    created_at = Column(DateTime, default=datetime.utcnow)

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True)
    hostname = Column(String(100))
    ip_address = Column(String(50))
    os_type = Column(String(50))
    agent_version = Column(String(20))

class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    json = Column(Text)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProcessEvent(Base):
    __tablename__ = "process_events"
    id = Column(Integer, primary_key=True)
    pid = Column(Integer)
    process_name = Column(String(200))
    cmdline = Column(Text)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    event_type = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

class NetworkEvent(Base):
    __tablename__ = "network_events"
    id = Column(Integer, primary_key=True)
    source_ip = Column(String(50))
    source_port = Column(Integer)
    destination_ip = Column(String(50))
    destination_port = Column(Integer)
    protocol = Column(String(20))
    event_type = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

class FileEvent(Base):
    __tablename__ = "file_events"
    id = Column(Integer, primary_key=True)
    file_path = Column(Text)
    operation = Column(String(50))
    event_type = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    level = Column(String(20))
    rule = Column(String(100))
    description = Column(Text)
    rule_metadata = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
