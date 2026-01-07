from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app import models, crud, auth, db
from app.db import engine, Base
from routers import processes, alerts, rules, users, actions

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