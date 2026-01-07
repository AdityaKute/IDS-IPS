import { NavLink } from 'react-router-dom';

const linkStyle = ({isActive}) => ({display:'block', padding:'8px 12px', textDecoration:'none', color: isActive ? '#fff' : '#333', background: isActive ? '#007bff' : 'transparent', borderRadius:4, marginBottom:6});

export default function Sidebar(){
  return (
    <div style={{width:220, padding:12, borderRight:'1px solid #eee', minHeight:'calc(100vh - 48px)'}}>
      <nav>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/alerts" style={linkStyle}>Alerts</NavLink>
        <NavLink to="/rules" style={linkStyle}>Rules</NavLink>
        <NavLink to="/processes" style={linkStyle}>Processes</NavLink>
        <NavLink to="/users" style={linkStyle}>Users</NavLink>
      </nav>
    </div>
  )
}
