from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "member"

class AgentCreate(BaseModel):
    hostname: str
    ip_address: str
    os_type: str
    agent_version: Optional[str] = "1.0"

class RuleCreate(BaseModel):
    name: str
    json: str
    enabled: Optional[bool] = True

class ProcessEventCreate(BaseModel):
    pid: int
    process_name: str
    cmdline: str
    cpu_usage: float
    memory_usage: float
    event_type: str

class NetworkEventCreate(BaseModel):
    source_ip: str
    source_port: int
    destination_ip: str
    destination_port: int
    protocol: str
    event_type: str

class FileEventCreate(BaseModel):
    file_path: str
    operation: str
    event_type: str

class AlertCreate(BaseModel):
    level: str
    rule: str
    description: str
    metadata: Optional[str] = None
