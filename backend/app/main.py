from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException
# initialize structured logging
from app import logging_config
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app import models, crud, auth, db
from app.db import engine, Base
from routers import processes, alerts, rules, users, actions, realtime, attack_intel, network, agents, audit_logs, threats

# NOTE: database schema is managed via migrations. Do not create tables implicitly in production.
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title='IDS-IPS Backend')

# allow Vite dev server (and similar) to call this API during local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(processes.router)
app.include_router(alerts.router)
app.include_router(rules.router)
app.include_router(users.router)
app.include_router(actions.router)
app.include_router(realtime.router)
app.include_router(agents.router)
app.include_router(attack_intel.router)
app.include_router(network.router)
app.include_router(audit_logs.router)
app.include_router(threats.router)

# Background periodic learning job
import threading
from time import sleep
from utils.learning import analyze_recent_unrecognized

def _background_learning_loop():
    # run at startup and then every 300 seconds
    try:
        while True:
            try:
                analyze_recent_unrecognized(None, 600)
            except Exception:
                pass
            sleep(300)
    except Exception:
        return

# start background thread (daemon) so it doesn't block shutdown
t = threading.Thread(target=_background_learning_loop, daemon=True)
t.start()

@app.post('/token')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(db.get_db)):
    # here 'username' field will contain email (OAuth2 standard uses username param)
    user = crud.get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect email or password')
    try:
        ok = auth.verify_password(form_data.password, user.password_hash)
    except ValueError as e:
        # password too long or other hashing issue
        raise HTTPException(status_code=400, detail=str(e))

    if not ok:
        raise HTTPException(status_code=400, detail='Incorrect email or password')

    access_token = auth.create_access_token(data={'sub': user.email})
    return {'access_token': access_token, 'token_type': 'bearer'}

@app.get("/")
def root():
    return {"status": "running"}