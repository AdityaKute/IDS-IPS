import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="center-page">
      <div className="card" style={{textAlign:'center'}}>
        <h1>IDS/IPS Dashboard</h1>
        <p style={{maxWidth:600, margin:'0 auto'}}>Welcome to the IDS/IPS monitoring dashboard. This is a public landing page placeholder and can be updated with a project description, screenshots, or login information.</p>
        <div style={{marginTop:20}}>
          <button style={{marginRight:8, padding:'8px 16px'}} onClick={() => navigate('/login')}>Sign In</button>
          <button style={{marginLeft:8, padding:'8px 16px'}} onClick={() => navigate('/register')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}
