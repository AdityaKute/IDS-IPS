from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import models
from app.db import get_db
import os

SECRET_KEY = os.getenv('SECRET_KEY','secretkeyforproj')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto', bcrypt__truncate_error=True)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/token')

def _ensure_password_length(password: str):
    # bcrypt has a 72-byte limit for passwords. Enforce using UTF-8 bytes length.
    if len(password.encode('utf-8')) > 72:
        raise ValueError("Password too long: bcrypt supports max 72 bytes when UTF-8 encoded. Use a shorter password.")


def _normalize_bcrypt_error(e: Exception) -> str:
    msg = str(e) or ""
    lm = msg.lower()
    if 'password cannot be longer than 72 bytes' in lm or 'password too long' in lm or 'longer than 72' in lm:
        return "Password too long: bcrypt supports a maximum of 72 bytes when UTF-8 encoded. Please use a shorter password."
    return msg


def verify_password(plain_password: str, hashed_password: str) -> bool:
    _ensure_password_length(plain_password)
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        # map bcrypt/passlib error into a friendly message
        raise ValueError(_normalize_bcrypt_error(e))


def get_password_hash(password: str) -> str:
    _ensure_password_length(password)
    try:
        return pwd_context.hash(password)
    except ValueError as e:
        # map bcrypt/passlib error into a friendly message
        raise ValueError(_normalize_bcrypt_error(e))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if user is None:
        raise credentials_exception

    return user

def require_roles(allowed_roles: list):
    def role_checker(
        current_user=Depends(get_current_user)
    ):
        # current_user.role is a Role ORM object; check its name
        role_name = None
        if getattr(current_user, 'role', None):
            role_name = getattr(current_user.role, 'name', None)
        if role_name is None or role_name not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Insufficient permissions"
            )
        return current_user
    return role_checker
