import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { login, setRole } from "../auth/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, []);


  const handleLogin = async () => {
    // validate password length before sending (bcrypt limit)
    const len = new TextEncoder().encode(password).length;
    if (len > 72) {
      setError("Password too long: must be 72 bytes or fewer when encoded in UTF-8");
      return;
    }

    try {
      const form = new URLSearchParams();
      form.append("username", email); // OAuth2 expects 'username' field, we pass email here
      form.append("password", password);

      // explicitly send as form-urlencoded and log errors for debugging
      const res = await api.post("/token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      const tokenVal = res?.data?.access_token;
      if (!tokenVal) {
        console.error('Login response missing token:', res);
        setError('Login failed: server did not return an access token');
        return;
      }
      login(tokenVal);

      // fetch user info to get role
      try {
        const me = await api.get('/users/me');
        const role = me?.data?.role;
        if (role) setRole(role);
      } catch (e) {
        // Not fatal; continue
        console.warn('Could not fetch user info after login', e);
      }

      navigate("/dashboard");
    } catch (err) {
      // log full error to browser console for diagnosis
      console.error('Login error:', err);
      setError(err?.response?.data?.detail || err?.message || "Login failed");
    }
  };

  return (
    <div className="center-page">
      <div className="card">
        <h2>IDS/IPS Login</h2>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        <p style={{marginTop:12}}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
