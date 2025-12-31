from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "Viewer"

    @validator('password')
    def password_max_bytes(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password too long: bcrypt supports max 72 bytes when UTF-8 encoded')
        return v

class UserOut(BaseModel):
    id: int
    email: str
    role: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True

class AgentCreate(BaseModel):
    agent_id: str
    hostname: Optional[str]
    ip_address: Optional[str]
    os: Optional[str]

class RuleCreate(BaseModel):
    name: str
    rule_type: str
    condition: Dict[str, Any]
    action: str
    severity: Optional[str] = "MEDIUM"
    is_active: Optional[bool] = True

class ProcessEventCreate(BaseModel):
    agent_id: int
    pid: int
    process_name: str
    cpu_usage: float
    memory_usage: float
    event_type: str

class NetworkEventCreate(BaseModel):
    agent_id: int
    local_ip: Optional[str]
    remote_ip: Optional[str]
    local_port: Optional[int]
    remote_port: Optional[int]
    protocol: Optional[str]
    direction: Optional[str]

class FileEventCreate(BaseModel):
    agent_id: int
    file_path: str
    event_type: str

class AlertCreate(BaseModel):
    agent_id: int
    rule_id: Optional[int]
    title: Optional[str]
    description: str
    severity: Optional[str]
    action_taken: Optional[str]
