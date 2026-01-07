import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Processes() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/processes/recent").then(res => {
      if (!mounted) return;
      setData(res.data || []);
    }).catch(err => {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch processes');
    }).finally(() => setLoading(false));
    return () => { mounted = false };
  }, []);

  if (loading) return <div>Loading process events...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h2>Process Events</h2>
      <ul>
        {data.map(p => (
          <li key={p.id}>{p.process_name} ({p.event_type})</li>
        ))}
      </ul>
    </div>
  );
}
