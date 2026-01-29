import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AuditLogs(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/audit-logs').then(r => { 
      if (mounted) setItems(r.data || []); 
    }).catch(e => {
      if (mounted) setError(e?.response?.data?.detail || e?.message);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => mounted = false;
  }, []);

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading audit logs...</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Audit Logs</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>System & user actions ({items.length})</p>
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

      {items.length === 0 ? (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(148,163,184,0.1)',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          No audit logs available
        </div>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(148,163,184,0.1)'}}>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Action</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Actor</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Target</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} style={{borderBottom: '1px solid rgba(148,163,184,0.05)'}}>
                <td style={{padding: '12px'}}>
                  <span style={{
                    backgroundColor: '#1e3a8a',
                    color: '#93c5fd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {i.action_type}
                  </span>
                </td>
                <td style={{padding: '12px'}}>{i.actor || 'System'}</td>
                <td style={{padding: '12px', color: '#94a3b8'}}>{i.target || 'N/A'}</td>
                <td style={{padding: '12px', color: '#94a3b8', fontSize: '12px'}}>
                  {new Date(i.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}