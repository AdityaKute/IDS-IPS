import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/alerts").then(res => {
      if (!mounted) return;
      setAlerts(res.data || []);
    }).catch(err => {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch alerts');
    }).finally(() => setLoading(false));
    return () => { mounted = false };
  }, []);

  if (loading) return <div>Loading alerts...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h2>Alerts</h2>
      <ul>
        {alerts.map(a => (
          <li key={a.id}>{a.severity} - {a.title}</li>
        ))}
      </ul>
    </div>
  );
}
