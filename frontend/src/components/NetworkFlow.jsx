import React, { useEffect, useState } from 'react';
import ReactFlow, { Controls } from 'react-flow-renderer';
import { connectWS } from '../api/realtime';

export default function NetworkFlow() {
  const [elements, setElements] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    let ws = connectWS(token, null, (msg) => {
      if (!msg || msg.type !== 'network') return;
      const payload = msg.payload;
      // payload could be { source, target, label }
      const src = `node_${payload.source}`;
      const tgt = `node_${payload.target}`;
      setElements(prev => {
        const existingNodes = new Map(prev.map(e => [e.id, e]));
        existingNodes.set(src, { id: src, data: { label: payload.source }, position: { x: Math.random()*400, y: Math.random()*400 } });
        existingNodes.set(tgt, { id: tgt, data: { label: payload.target }, position: { x: Math.random()*400, y: Math.random()*400 } });
        const edges = [...prev.filter(e => e.source && e.target)];
        edges.push({ id: `e_${src}_${tgt}_${Date.now()}`, source: src, target: tgt, animated: true, label: payload.label });
        return [...Array.from(existingNodes.values()), ...edges];
      });
    }, (err) => {
      console.warn('WS network error', err);
    });
    return () => { ws && ws.close && ws.close(); };
  }, []);

  return (
    <div style={{ height: 500 }}>
      <ReactFlow elements={elements}>
        <Controls />
      </ReactFlow>
    </div>
  );
}
