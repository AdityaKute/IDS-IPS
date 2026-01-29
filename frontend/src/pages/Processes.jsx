import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Processes() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("/processes/recent").then(res => {
      if (!mounted) return;
      setData(res.data || []);
    }).catch(err => {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch processes');
    }).finally(() => setLoading(false));
    return () => { mounted = false };
  }, []);

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading process events...</div>;
  if (error) return <div style={{padding: '20px', color: '#f87171'}}>{error}</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Process Events</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>Recent system process activity ({data.length} events)</p>
      </header>

      {data.length === 0 ? (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(148,163,184,0.1)',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          No recent process events detected
        </div>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(148,163,184,0.1)'}}>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Process Name</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>PID</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>CPU %</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Memory %</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Event Type</th>
              <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id} style={{borderBottom: '1px solid rgba(148,163,184,0.05)'}}>
                <td style={{padding: '12px'}}>{p.process_name || 'N/A'}</td>
                <td style={{padding: '12px'}}>{p.pid || 'N/A'}</td>
                <td style={{padding: '12px'}}>{p.cpu_usage?.toFixed(2) || '0.00'}%</td>
                <td style={{padding: '12px'}}>{p.memory_usage?.toFixed(2) || '0.00'}%</td>
                <td style={{padding: '12px'}}>
                  <span style={{
                    backgroundColor: p.event_type === 'CREATE' ? '#065f46' : p.event_type === 'TERMINATE' ? '#7f1d1d' : '#1e3a8a',
                    color: p.event_type === 'CREATE' ? '#d1fae5' : p.event_type === 'TERMINATE' ? '#fee2e2' : '#93c5fd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {p.event_type || 'UNKNOWN'}
                  </span>
                </td>
                <td style={{padding: '12px', color: '#94a3b8', fontSize: '12px'}}>
                  {new Date(p.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
