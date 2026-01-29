from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role")

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True)
    agent_id = Column(String(100), unique=True, nullable=False)
    hostname = Column(String(100))
    os = Column(String(50))
    ip_address = Column(String(45))
    last_seen = Column(DateTime)
    status = Column(String(10), default="OFFLINE")
    registered_at = Column(DateTime, default=datetime.utcnow)

class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    rule_type = Column(String(20), nullable=False)
    condition = Column(JSON, nullable=False)
    action = Column(String(50), nullable=False)
    severity = Column(String(10), default="MEDIUM")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProcessEvent(Base):
    __tablename__ = "process_events"
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    process_name = Column(String(150))
    pid = Column(Integer)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    event_type = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)

class NetworkEvent(Base):
    __tablename__ = "network_events"
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    local_ip = Column(String(45))
    remote_ip = Column(String(45))
    local_port = Column(Integer)
    remote_port = Column(Integer)
    protocol = Column(String(10))
    direction = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)

class FileEvent(Base):
    __tablename__ = "file_events"
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    file_path = Column(Text)
    event_type = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    rule_id = Column(Integer, ForeignKey("rules.id"))
    title = Column(String(150))
    description = Column(Text)
    severity = Column(String(10))
    action_taken = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class AttackType(Base):
    __tablename__ = "attack_types"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)

class AttackPattern(Base):
    __tablename__ = "attack_patterns"
    id = Column(Integer, primary_key=True)
    attack_type_id = Column(Integer, ForeignKey("attack_types.id"), nullable=False)
    process_name = Column(String(200))
    cmdline_regex = Column(String(500))
    url_pattern = Column(String(500))
    ip_pattern = Column(String(255))
    frequency_threshold = Column(Integer, default=0)
    severity = Column(String(10), default="MEDIUM")
    recommended_action = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class IPSAction(Base):
    __tablename__ = "ips_actions"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    system_action = Column(String(100))
    params = Column(JSON)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    action_type = Column(String(100))
    actor = Column(String(150))
    target = Column(String(255))
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

# extended fields for agents
Agent.api_token = Column(String(255), nullable=True)
Agent.network_range = Column(String(100), nullable=True)

class UnrecognizedAttack(Base):
    __tablename__ = "unrecognized_attacks"
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    telemetry = Column(JSON)
    assigned_severity = Column(String(10), default="LOW")
    status = Column(String(20), default="PENDING")  # PENDING, UNDER_REVIEW, LEARNING, CONFIRMED, FALSE_POSITIVE
    cluster_id = Column(String(100), nullable=True)
    learning_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProposedPattern(Base):
    __tablename__ = "proposed_patterns"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    pattern = Column(JSON)
    proposed_by = Column(String(150))
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    linked_attack_type_id = Column(Integer, ForeignKey("attack_types.id"), nullable=True)
    votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class LearningJob(Base):
    __tablename__ = "learning_jobs"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    status = Column(String(20), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
