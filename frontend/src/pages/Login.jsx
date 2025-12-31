import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { login } from "../auth/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      const res = await api.post("/token", form);
      login(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div>
      <h2>IDS/IPS Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}
