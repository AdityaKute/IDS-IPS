export function connectSSEAlerts(token, onMessage, onError) {
  const url = `${import.meta.env.VITE_API_BASE || ''}/realtime/sse/alerts?token=${token}`;
  const s = new EventSource(url);
  s.onmessage = (e) => {
    try { const d = JSON.parse(e.data); onMessage(d); } catch(err){ onError && onError(err); }
  };
  s.onerror = (err) => { onError && onError(err); s.close(); };
  return s;
}

export function connectWS(token, onOpen, onMessage, onError) {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/^http/, 'ws');
  const url = `${base}/realtime/ws/alerts?token=${token}`;
  const ws = new WebSocket(url);
  ws.onopen = onOpen;
  ws.onmessage = (m) => { try { onMessage(JSON.parse(m.data)); } catch(e){ onError && onError(e); } };
  ws.onerror = onError;
  ws.onclose = () => onError && onError(new Error('ws closed'));
  return ws;
}