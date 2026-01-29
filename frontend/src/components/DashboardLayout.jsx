import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout(){
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Header />
      <div style={{display:'flex', flex:1}}>
        <Sidebar />
        <main style={{padding:20, flex:1}}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
