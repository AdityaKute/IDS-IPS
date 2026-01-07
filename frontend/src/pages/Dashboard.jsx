import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getRole } from '../auth/auth';

export default function Dashboard(){
  const [counts, setCounts] = useState({ alerts:0, rules:0, processes:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = getRole();

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/alerts').then(r => r.data.length).catch(() => 0),
      api.get('/rules').then(r => r.data.length).catch(() => 0),
      api.get('/processes/recent').then(r => r.data.length).catch(() => 0),
    ]).then(([alerts, rules, processes]) => {
      if (!mounted) return;
      setCounts({ alerts, rules, processes });
    }).catch(err => {
      setError(err?.response?.data?.detail || err?.message);
    }).finally(() => setLoading(false));
    return () => { mounted = false };
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Role: <strong>{role}</strong></p>
      <div style={{display:'flex', gap:12}}>
        <div style={{padding:12, border:'1px solid #eee', borderRadius:6}}>Alerts: <strong>{counts.alerts}</strong></div>
        <div style={{padding:12, border:'1px solid #eee', borderRadius:6}}>Rules: <strong>{counts.rules}</strong></div>
        <div style={{padding:12, border:'1px solid #eee', borderRadius:6}}>Process events: <strong>{counts.processes}</strong></div>
      </div>
    </div>
  )
}
