import { useState, useRef, useEffect } from 'react';
import { User, Bell, LogOut, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, level: 'High', message: 'Intrusion detected from 192.168.1.50', time: '2 minutes ago' },
    { id: 2, level: 'Medium', message: 'Suspicious network connection', time: '5 minutes ago' },
    { id: 3, level: 'Info', message: 'Pattern analysis completed', time: '15 minutes ago' }
  ]);
  const adminRef = useRef(null);
  const notifRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="header-content" style={{ marginBottom: '20px', paddingTop: '20px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <h1>
          IDS / IPS <span className="blue-text">SECURITY SYSTEM</span>
        </h1>
        <div className="glow-line-main"></div>
        <p className="subtitle">Intrusion Detection & Prevention</p>
      </div>

      {/* Header Buttons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Notifications Button */}
        <div className="relative" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.3)'}
          >
            <Bell size={20} color="#cbd5e1" />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {notifications.length}
            </span>
          </button>
          {notifOpen && (
            <div style={{
              position: 'absolute',
              right: '0',
              marginTop: '8px',
              width: '320px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              color: '#cbd5e1',
              zIndex: 50,
              opacity: 0.9
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Notifications</h4>
                <button 
                  onClick={clearNotifications}
                  style={{ fontSize: '12px', color: '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                >
                  Clear All
                </button>
              </div>
              <ul style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <li style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No notifications</li>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      <p style={{ fontSize: '13px', margin: '0' }}><span style={{ fontWeight: 600, color: notif.level === 'High' ? '#ef4444' : notif.level === 'Medium' ? '#f97316' : '#22c55e' }}>[{notif.level}]</span> {notif.message}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>{notif.time}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Admin Button */}
        <div className="relative" ref={adminRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setAdminOpen(!adminOpen)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.3)'}
          >
            <User size={20} color="#f472b6" />
          </button>
          {adminOpen && (
            <div style={{
              position: 'absolute',
              right: '0',
              marginTop: '8px',
              width: '180px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              color: '#cbd5e1',
              zIndex: 50,
              opacity: 0.9,
              overflow: 'hidden'
            }}>
              <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'} onMouseLeave={(e) => e.target.style.background = 'none'}>
                Profile
              </button>
              <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'} onMouseLeave={(e) => e.target.style.background = 'none'}>
                <Settings size={16} /> Settings
              </button>
              <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '0 0 12px 12px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'} onMouseLeave={(e) => e.target.style.background = 'none'}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
