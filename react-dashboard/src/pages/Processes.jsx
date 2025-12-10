import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Processes(){
  const [procs, setProcs] = useState([]);
  useEffect(()=>{
    api.get('/processes/recent').then(r=>setProcs(r.data)).catch(()=>{});
  },[]);
  return (
    <div className="container mt-3">
      <h3>Processes</h3>
      <table className="table table-sm">
        <thead><tr><th>PID</th><th>Name</th><th>CPU</th><th>Memory</th></tr></thead>
        <tbody>
          {procs.map(p=>(<tr key={p.id}><td>{p.pid}</td><td>{p.name}</td><td>{p.cpu}</td><td>{p.memory}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}