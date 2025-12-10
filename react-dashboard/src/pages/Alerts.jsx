import React, { useEffect, useState } from 'react';
import api from '../api';
export default function Alerts(){
  const [alerts, setAlerts] = useState([]);
  useEffect(()=>{ api.get('/alerts/').then(r=>setAlerts(r.data)).catch(()=>{}); },[]);
  return (<div className="container mt-3"><h3>Alerts</h3>
    <ul className="list-group">
      {alerts.map(a=>(<li key={a.id} className="list-group-item"><b>{a.level}</b> - {a.rule} - {a.description}</li>))}
    </ul>
  </div>)
}