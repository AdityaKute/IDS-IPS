import asyncio
import json
from typing import Dict
from fastapi import WebSocket, WebSocketDisconnect
from starlette.responses import StreamingResponse
from jose import jwt, JWTError
import os
from app import auth, db, models
from sqlalchemy.orm import Session

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.sse_subscribers: Dict[str, asyncio.Queue] = {}

    async def connect(self, websocket: WebSocket, token: str):
        # validate token and accept connection
        await websocket.accept()
        email = self._validate_token_to_email(token)
        if not email:
            await websocket.close(code=1008)
            return None
        self.active_connections[email] = websocket
        return email

    def disconnect(self, email: str):
        if email in self.active_connections:
            try:
                del self.active_connections[email]
            except KeyError:
                pass

    async def send_personal(self, email: str, message: dict):
        ws = self.active_connections.get(email)
        if not ws:
            return
        try:
            await ws.send_json(message)
        except Exception:
            self.disconnect(email)

    async def broadcast(self, message: dict):
        # send to all websocket clients
        to_remove = []
        for email, ws in list(self.active_connections.items()):
            try:
                await ws.send_json(message)
            except Exception:
                to_remove.append(email)
        for e in to_remove:
            self.disconnect(e)

    # SSE related
    async def subscribe_sse(self, token: str):
        email = self._validate_token_to_email(token)
        if not email:
            return None
        queue = asyncio.Queue()
        self.sse_subscribers[email] = queue
        return email, queue

    def unsubscribe_sse(self, email: str):
        if email in self.sse_subscribers:
            try:
                del self.sse_subscribers[email]
            except KeyError:
                pass

    async def broadcast_sse(self, message: dict):
        # put message into all queues
        for q in list(self.sse_subscribers.values()):
            try:
                await q.put(message)
            except Exception:
                pass

    def _validate_token_to_email(self, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get('sub')
            return email
        except JWTError:
            # fallback: check if token matches an Agent.api_token
            try:
                from app.db import get_db
                db = next(get_db())
                from app import models
                agent = db.query(models.Agent).filter(models.Agent.api_token == token).first()
                if agent:
                    return f"agent:{agent.agent_id}"
            except Exception:
                pass
            return None

# global manager instance
manager = WebSocketManager()

# helper to build SSE streaming generator
async def sse_event_generator(queue: asyncio.Queue):
    try:
        while True:
            data = await queue.get()
            payload = json.dumps(data)
            yield f"data: {payload}\n\n"
    except asyncio.CancelledError:
        return
