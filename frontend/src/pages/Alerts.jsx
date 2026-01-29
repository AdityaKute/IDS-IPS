import { useEffect, useState } from "react";
import api from "../api/axios";
import { connectSSEAlerts } from "../api/realtime";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("/alerts").then(res => {
      if (!mounted) return;
      setAlerts(res.data || []);
    }).catch(err => {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch alerts');
    }).finally(() => setLoading(false));

    // connect SSE for live alerts
    const token = localStorage.getItem('token');
    let sse = null;
    try {
      sse = connectSSEAlerts(token, (msg) => {
        if (!mounted) return;
        if (msg && msg.type === 'alert' && msg.payload) {
          setAlerts(prev => [msg.payload, ...prev].slice(0, 200));
        }
      }, (err) => {
        console.warn('SSE error', err);
      });
    } catch(err){
      console.warn('SSE unavailable', err);
    }

    return () => { mounted = false; if (sse && sse.close) sse.close(); };
  }, []);

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading alerts...</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Security Alerts</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>Real-time threat notifications ({alerts.length})</p>
      </header>

      {error && (
        <div style={{ 
          backgroundColor: '#7f1d1d', 
          color: '#fca5a5', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(148,163,184,0.1)',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          No alerts at this time
        </div>
      ) : (
        <div style={{display: 'grid', gap: '15px'}}>
          {alerts.map(a => (
            <div key={a.id} style={{
              backgroundColor: '#0f172a',
              border: `2px solid ${a.severity === 'HIGH' ? '#dc2626' : a.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`,
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                <div>
                  <div style={{fontWeight: 'bold', color: '#fff'}}>{a.title}</div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '5px'}}>
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={{
                  backgroundColor: a.severity === 'HIGH' ? '#7f1d1d' : a.severity === 'MEDIUM' ? '#b45309' : '#1e3a8a',
                  color: a.severity === 'HIGH' ? '#fca5a5' : a.severity === 'MEDIUM' ? '#fcd34d' : '#93c5fd',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {a.severity}
                </span>
              </div>

              {a.description && (
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '10px',
                  color: '#d1d5db'
                }}>
                  {a.description}
                </div>
              )}

              {a.action_taken && (
                <div style={{
                  color: '#86efac',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Action taken: {a.action_taken}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
