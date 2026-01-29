import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="main-wrapper">
      <header className="header-content">
        <h1>
          IDS / IPS <span className="blue-text">SECURITY SYSTEM</span>
        </h1>
        <div className="glow-line-main"></div>
        <p className="subtitle">Intrusion Detection & Prevention</p>
      </header>

      <div className="auth-card">
        <div className="card-section top-section">
          <h2 className="form-title">Sentinel Security Platform</h2>
          <div className="overlap-glow top-glow"></div>
        </div>

        <div className="card-section form-section">
          <p className="subtitle footer-content narrow-text">
            Enterprise-grade threat detection and automated prevention system with real-time monitoring, 
            AI-powered threat analysis, and zero-input automation. Protect your organization from advanced threats.
          </p>

          <div style={{marginTop: '20px', marginBottom: '15px', fontSize: '14px', color: '#94a3b8'}}>
            <p><strong>Key Features:</strong></p>
            <ul style={{marginLeft: '20px', marginTop: '10px'}}>
              <li>✓ Real-time threat detection & response</li>
              <li>✓ Automated IPS actions (kill process, block IP, etc.)</li>
              <li>✓ Unknown threat learning with ML</li>
              <li>✓ Live WebSocket/SSE dashboard</li>
              <li>✓ Role-based access control (RBAC)</li>
              <li>✓ Complete audit trail & compliance</li>
            </ul>
          </div>

          <div className="cta-row">
            <button className="cta-btn" onClick={() => navigate('/login')}>Sign In</button>
            <button className="cta-btn primary" onClick={() => navigate('/register')}>Create Account</button>
          </div>
        </div>

        <div className="card-section footer-section">
          <div className="overlap-glow bottom-glow"></div>
          <div style={{textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '15px'}}>
            <p>Version 1.0.0 | © 2024 Sentinel Security | Production Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
