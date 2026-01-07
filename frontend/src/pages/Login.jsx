import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { login, logout } from "../auth/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debug, setDebug] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
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
        setDebug({ ok: false, error: res?.data });
        return;
      }
      login(tokenVal);
      setToken(tokenVal);
      setDebug({ ok: true, data: res.data });
      navigate("/dashboard");
    } catch (err) {
      // log full error to browser console for diagnosis
      console.error('Login error:', err);
      setError(err?.response?.data?.detail || err?.message || "Login failed");
      setDebug({ ok: false, error: err?.response?.data || { message: err?.message } });
    }
  };

  return (
    <div>
      <h2>IDS/IPS Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{border:'1px solid #ccc', padding:8, marginTop:12}}>
        <h4>Debug 🐞</h4>
        <p>Token: {token ? <code style={{wordBreak:'break-all'}}>{token}</code> : <em>none</em>}</p>
        <button onClick={() => { logout(); setToken(''); }}>Clear token</button>
        <pre style={{whiteSpace:'pre-wrap', marginTop:8}}>{JSON.stringify(debug, null, 2)}</pre>
      </div>

      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}
