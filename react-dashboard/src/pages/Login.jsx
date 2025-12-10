import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';

export default function Login(){
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const { login } = useContext(AuthContext);

  const submit = async (e) =>{ e.preventDefault(); await login(u,p); }
  return (
    <div className="container mt-5">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <input className="form-control mb-2" value={u} onChange={e=>setU(e.target.value)} placeholder="username" />
        <input type="password" className="form-control mb-2" value={p} onChange={e=>setP(e.target.value)} placeholder="password" />
        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  )
}