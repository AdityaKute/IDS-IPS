import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Unrecognized(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await api.get('/attack-intel/unrecognized');
      setItems(res.data || []);
    } catch(err) {
      setError(err?.response?.data?.detail || err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const propose = async (id) => {
    try {
      await api.post(`/attack-intel/unrecognized/${id}/propose`);
      await fetchItems();
    } catch(err) { 
      setError(err?.response?.data?.detail || err?.message);
    }
  };

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading unrecognized threats...</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Unrecognized Threats</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>Threats that don't match known patterns ({items.length})</p>
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
          No unrecognized threats detected
        </div>
      ) : (
        <div style={{display: 'grid', gap: '15px'}}>
          {items.map(i => (
            <div key={i.id} style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(148,163,184,0.1)',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                <div>
                  <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Threat #{i.id}</div>
                  <div style={{fontSize: '12px', color: '#94a3b8'}}>{new Date(i.created_at).toLocaleString()}</div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <span style={{
                    backgroundColor: i.assigned_severity === 'HIGH' ? '#7f1d1d' : i.assigned_severity === 'MEDIUM' ? '#b45309' : '#065f46',
                    color: i.assigned_severity === 'HIGH' ? '#fca5a5' : i.assigned_severity === 'MEDIUM' ? '#fcd34d' : '#d1fae5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {i.assigned_severity}
                  </span>
                  <span style={{
                    backgroundColor: i.status === 'PENDING' ? '#1e3a8a' : i.status === 'UNDER_REVIEW' ? '#b45309' : '#065f46',
                    color: i.status === 'PENDING' ? '#93c5fd' : i.status === 'UNDER_REVIEW' ? '#fcd34d' : '#d1fae5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {i.status}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#1e293b',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '150px',
                overflow: 'auto',
                marginBottom: '10px',
                color: '#d1d5db'
              }}>
                <pre style={{margin: 0}}>
                  {JSON.stringify(i.telemetry, null, 2)}
                </pre>
              </div>

              {i.status === 'PENDING' && (
                <button
                  onClick={() => propose(i.id)}
                  style={{
                    backgroundColor: '#0ea5e9',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Generate Pattern Proposal
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}