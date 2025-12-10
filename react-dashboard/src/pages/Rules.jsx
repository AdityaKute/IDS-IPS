import React, { useEffect, useState } from 'react';
import api from '../api';
export default function Rules(){
  const [rules, setRules] = useState([]);
  useEffect(()=>{ api.get('/rules/').then(r=>setRules(r.data)).catch(()=>{}); },[]);
  return (<div className="container mt-3"><h3>Rules</h3>
    <pre>{JSON.stringify(rules, null, 2)}</pre>
  </div>)
}
