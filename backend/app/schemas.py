from pydantic import BaseModel
from typing import Optional
import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = 'member'

class Token(BaseModel):
    access_token: str
    token_type: str

class ProcessLogCreate(BaseModel):
    pid: int
    name: str
    cmdline: str
    cpu: float
    memory: float

class AlertCreate(BaseModel):
    level: str
    rule: str
    description: str
    process_id: Optional[int]
    metadata: Optional[str]

class RuleCreate(BaseModel):
    name: str
    json: str
    enabled: Optional[bool] = True
