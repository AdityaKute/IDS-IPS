import { NavLink } from 'react-router-dom';

const linkStyle = ({isActive}) => ({display:'block', padding:'8px 12px', textDecoration:'none', color: '#000', background: isActive ? '#007bff' : 'rgba(255, 255, 255, 0.9)', borderRadius:'12px', marginBottom:6});

export default function Sidebar(){
  return (
    <div style={{width:220, padding:12, borderRight:'1px solid #eee', minHeight:'calc(100vh - 48px)', opacity: 0.9}}>
      <nav>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/alerts" style={linkStyle}>Alerts</NavLink>
        <NavLink to="/rules" style={linkStyle}>Rules</NavLink>
        <NavLink to="/attack-intel" style={linkStyle}>Attack Intel</NavLink>
        <NavLink to="/unrecognized" style={linkStyle}>Unrecognized</NavLink>
        <NavLink to="/audit-logs" style={linkStyle}>Audit Logs</NavLink>
        <NavLink to="/processes" style={linkStyle}>Processes</NavLink>
        <NavLink to="/users" style={linkStyle}>Users</NavLink>
      </nav>
    </div>
  )
}
