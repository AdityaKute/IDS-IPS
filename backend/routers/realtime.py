from fastapi import APIRouter, WebSocket, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.ws import manager, sse_event_generator
from app import auth, db, models
from app.db import get_db
from sqlalchemy.orm import Session
import asyncio

router = APIRouter(prefix="/realtime", tags=["Realtime"]) 

@router.websocket('/ws/alerts')
async def ws_alerts(websocket: WebSocket):
    # accept connection with token as query param
    token = websocket.query_params.get('token')
    if not token:
        await websocket.close(code=1008)
        return
    email = await manager.connect(websocket, token)
    if not email:
        return
    try:
        while True:
            # simple ping/pong for keepalive; clients may send messages too
            msg = await websocket.receive_text()
            # ignore or handle as needed
    except Exception:
        manager.disconnect(email)

@router.get('/sse/alerts')
async def sse_alerts(request: Request):
    # token must be provided as query param
    token = request.query_params.get('token')
    if not token:
        raise HTTPException(status_code=401, detail='Token required')
    subscribed = await manager.subscribe_sse(token)
    if not subscribed:
        raise HTTPException(status_code=401, detail='Invalid token')
    email, queue = subscribed

    async def event_stream():
        try:
            async for event in sse_event_generator(queue):
                yield event
                # disconnect if client gone
                if await request.is_disconnected():
                    break
        finally:
            manager.unsubscribe_sse(email)

    return StreamingResponse(event_stream(), media_type='text/event-stream')
