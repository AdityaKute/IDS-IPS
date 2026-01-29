import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [role, setRole] = useState("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Preserve original registration behavior: validate only password byte length and post email/password/role
  const handleRegister = async () => {
    // validate password bytes length (bcrypt limit)
    const len = new TextEncoder().encode(password).length;
    if (len > 72) {
      setMessage("Password too long: must be 72 bytes or fewer when encoded in UTF-8");
      return;
    }

    try {
      await api.post("/users/", { email, password, role });
      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Registration failed");
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
        <div className="card-section top-section">
          <h2 className="form-title">Create Your Account</h2>
          <div className="overlap-glow top-glow"></div>
        </div>

        <div className="card-section form-section">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2l7 3v5c0 5.25-3.804 9.5-7 11-3.196-1.5-7-5.75-7-11V5l7-3z"/></svg>
              </div>
              <select
                className="role-dropdown"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="Role"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="input-group">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v1.2l10 5.6 10-5.6V6c0-1.1-.9-2-2-2zm0 4.3l-8 4.5-8-4.5V18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8.3z"/></svg>
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>

            <div className="input-group">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"/></svg>
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="checkbox-row">
              <div className="custom-checkbox">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="checkmark"></span>
              </div>
              <label htmlFor="agree">
                I agree to the <a href="#" className="accent-blue">Terms of Service</a> and <a href="#" className="accent-blue">Privacy Policy</a>
              </label>
            </div>

            {message && <p className="message-line">{message}</p>}

            <div className="btn-container">
              <button type="button" className="signup-btn" onClick={handleRegister}>Sign Up</button>
            </div>
          </form>
        </div>

        <div className="card-section footer-section">
          <div className="overlap-glow bottom-glow"></div>
          <div className="footer-content">
            <p className="warning-text">Unauthorized Access is Prohibited</p>
            <br />
            <p className="login-footer">Already have an account? <Link to="/login" className="accent-blue">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
