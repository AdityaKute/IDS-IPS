import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(()=>{
    if(token){
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // fetch profile
      api.get('/users/me').then(r=>setUser(r.data)).catch(()=>{ setUser(null); setToken(null); localStorage.removeItem('token'); });
    }
  }, [token]);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const resp = await api.post('/token', params);
    const t = resp.data.access_token;
    localStorage.setItem('token', t);
    setToken(t);
  }

  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); }

  return <AuthContext.Provider value={{user, token, login, logout}}>{children}</AuthContext.Provider>
}