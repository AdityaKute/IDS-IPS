from fastapi import FastAPI, Depends
from .db import engine, Base
from .routers import processes, alerts, rules, users, actions
from . import models

Base.metadata.create_all(bind=engine)
app = FastAPI(title='IDS-IPS Backend')

app.include_router(processes.router)
app.include_router(alerts.router)
app.include_router(rules.router)
app.include_router(users.router)
app.include_router(actions.router)

# Token endpoint
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import db, crud, auth

@app.post('/token')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(db.get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    access_token = auth.create_access_token(data={'sub': user.username})
    return {'access_token': access_token, 'token_type': 'bearer'}
