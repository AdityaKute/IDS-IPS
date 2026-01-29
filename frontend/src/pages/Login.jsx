import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { login, setRole } from "../auth/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // validate password length before sending (bcrypt limit)
    const len = new TextEncoder().encode(password).length;
    if (len > 72) {
      setMessage("Password too long: must be 72 bytes or fewer when encoded in UTF-8");
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
        setMessage('Login failed: server did not return an access token');
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
      setMessage(err?.response?.data?.detail || err?.message || "Login failed");
    }
  };

  return (
    <div className="main-wrapper">
      <header className="header-content cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
        <h1>
          IDS / IPS <span className="blue-text">SECURITY SYSTEM</span>
        </h1>
        <div className="glow-line-main"></div>
        <p className="subtitle">Intrusion Detection & Prevention</p>
      </header>

      <div className="auth-card">
        {/* Section 1: Header */}
        <div className="card-section top-section">
          <h2 className="form-title">Login to Your Account</h2>
          <div className="overlap-glow top-glow"></div>
        </div>

        {/* Section 2: Form */}
        <div className="card-section form-section">
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm9 9v-1c0-3.866-3.582-7-9-7s-9 3.134-9 7v1h18z"/></svg>
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"/></svg>
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="checkbox-row row-between">
              <div className="checkbox-left">
                <div className="custom-checkbox">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                </div>
                <label htmlFor="remember">Remember Me</label>
              </div>
              <Link to="/forgot-password" size="small" className="accent-blue small-link">
                Forgot Password?
              </Link>
            </div>

            {message && (
              <p className={`message-line ${message.includes("successful") ? 'success-text' : 'warning-text'}`}>
                {message}
              </p>
            )}

            <div className="btn-container">
              <button type="submit" className="signup-btn">Login</button>
            </div>
          </form>
        </div>

        {/* Section 3: Footer */}
        <div className="card-section footer-section">
          <div className="overlap-glow bottom-glow"></div>
          <div className="footer-content">
            <p className="warning-text">Unauthorized Access is Prohibited</p>
            <br />
            <p className="login-footer">
              Don't have an account? <Link to="/register" className="accent-blue">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
