import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getRole } from '../auth/auth';

export default function Navbar(){
  const nav = useNavigate();
  const auth = isAuthenticated();
  const role = getRole();

  const doLogout = () => {
    logout();
    nav('/');
  }

  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 16px', borderBottom:'1px solid #eee', background:'#fff'}}>
      <div style={{fontWeight:700}}>IDS/IPS</div>
      <div style={{display:'flex', alignItems:'center'}}>
        {auth && <div style={{marginRight:12, fontSize:14}}>Role: <strong>{role}</strong></div>}
        {auth ? <button onClick={doLogout}>Logout</button> : <></>}
      </div>
    </div>
  )
}
