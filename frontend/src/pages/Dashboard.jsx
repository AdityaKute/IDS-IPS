import React, { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Bell, User, LogOut, CheckCircle, AlertTriangle, ShieldOff, Wifi, Users as UsersIcon, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const palette = {
  intrusion: '#ef4444',
  threat: '#f97316',
  falsepos: '#22c55e',
  connections: '#0ea5e9',
  bgA: '#020617',
  bgB: '#0f172a'
};

// Glass morphism card styles - Transparent without background
const glass = 'border border-slate-700/50 backdrop-blur-md rounded-2xl p-4';
const glassHover = `${glass} transition-all hover:border-slate-600/50`

export default function Dashboard() {
  // Add global styles for hiding scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * { scrollbar-width: none; }
      *::-webkit-scrollbar { display: none; }
      main { scrollbar-width: none; }
      main::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const navigate = useNavigate();
  // Stats and data
  const [quickStats, setQuickStats] = useState({ intrusion: 0, threats: 0, falsepos: 0, connections: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [bandwidth, setBandwidth] = useState({ incoming: 0, outgoing: 0 });
  const [topAttacks, setTopAttacks] = useState([]);
  const [recentIntrusions, setRecentIntrusions] = useState([]);
  const [users, setUsers] = useState([]);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notification & Admin dropdowns
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const notifRef = useRef(null);
  const adminRef = useRef(null);

  // Visited websites modal
  const [websitesModalOpen, setWebsitesModalOpen] = useState(false);
  const [selectedUserWebsites, setSelectedUserWebsites] = useState(null);

  // Initialize chart data for 7 days
  const initializeChartData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: 0,
        blocks: 0
      });
    }
    return data;
  };

  // Fetch all dashboard data on component mount
  useEffect(() => {
    let sse = null;
    let mounted = true;
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    setChartData(initializeChartData());

    // Dynamic import and fetch all data
    import('../api/axios').then(({ default: api }) => {
      Promise.all([
        // Fetch alerts (threats)
        api.get('/alerts').then(r => {
          if (!mounted) return;
          const alertCount = Array.isArray(r.data) ? r.data.length : 0;
          setQuickStats(prev => ({ ...prev, threats: alertCount }));
          return alertCount;
        }).catch(err => {
          console.error('Failed to fetch alerts:', err);
          return 0;
        }),
        
        // Fetch processes (intrusion attempts)
        api.get('/processes/recent').then(r => {
          if (!mounted) return;
          const processCount = Array.isArray(r.data) ? r.data.length : 0;
          setQuickStats(prev => ({ ...prev, intrusion: processCount }));
          return processCount;
        }).catch(err => {
          console.error('Failed to fetch processes:', err);
          return 0;
        }),
        
        // Fetch network events
        api.get('/network/recent').then(r => {
          if (!mounted) return;
          const events = Array.isArray(r.data) ? r.data : [];
          const incoming = events.filter(e => (e.direction || '').toLowerCase() === 'in').length || 0;
          const suspicious = events.filter(e => (e.direction || '').toLowerCase() === 'suspicious').length || 0;
          const malicious = events.filter(e => (e.direction || '').toLowerCase() === 'out').length || 0;
          
          setPieData([
            { name: 'Incoming', value: Math.max(1, incoming) },
            { name: 'Suspicious', value: Math.max(1, suspicious) },
            { name: 'Malicious', value: Math.max(1, malicious) }
          ]);
          setQuickStats(prev => ({ ...prev, connections: events.length }));
        }).catch(err => {
          console.error('Failed to fetch network data:', err);
          setPieData([
            { name: 'Incoming', value: 0 },
            { name: 'Suspicious', value: 0 },
            { name: 'Malicious', value: 0 }
          ]);
        }),
        
        // Fetch attack patterns
        api.get('/attack-intel/patterns').then(r => {
          if (!mounted) return;
          const patterns = Array.isArray(r.data) ? r.data : [];
          if (patterns.length > 0) {
            setTopAttacks(patterns.slice(0, 6).map((p, i) => ({
              name: p.process_name || p.name || `Pattern ${i + 1}`,
              count: 1,
              freq: 0.5
            })));
          } else {
            setTopAttacks([]);
          }
        }).catch(err => {
          console.error('Failed to fetch attack patterns:', err);
          setTopAttacks([]);
        }),
        
        // Fetch unrecognized events (recent intrusions)
        api.get('/attack-intel/unrecognized').then(r => {
          if (!mounted) return;
          const unrecognized = Array.isArray(r.data) ? r.data : [];
          if (unrecognized.length > 0) {
            setRecentIntrusions(unrecognized.map(u => ({
              ts: u.created_at || new Date(),
              src: (u.telemetry || {}).remote_ip || 'unknown',
              tgt: (u.telemetry || {}).local_ip || 'unknown',
              type: 'Unrecognized'
            })).slice(0, 10));
          } else {
            setRecentIntrusions([]);
          }
        }).catch(err => {
          console.error('Failed to fetch intrusions:', err);
          setRecentIntrusions([]);
        }),

        // Fetch users list
        api.get('/users/').then(r => {
          if (!mounted) return;
          const usersList = Array.isArray(r.data) ? r.data : [];
          setUsers(usersList);
        }).catch(err => {
          console.error('Failed to fetch users:', err);
          setUsers([]);
        })
      ]).then(() => {
        if (mounted) setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        if (mounted) {
          setError('Failed to load dashboard data');
          setLoading(false);
        }
      });
    }).catch(err => {
      console.error('API initialization failed:', err);
      if (mounted) {
        setError('Failed to initialize dashboard');
        setLoading(false);
      }
    });

    // Connect to SSE for real-time updates
    import('../api/realtime').then(({ connectSSEAlerts }) => {
      try {
        sse = connectSSEAlerts(token, (msg) => {
          if (!mounted) return;
          if (msg.type === 'alert' && msg.payload) {
            setQuickStats(prev => ({ ...prev, threats: prev.threats + 1 }));
            setChartData(prev => {
              const c = [...prev];
              c.shift();
              c.push({
                day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
                total: (c[c.length - 1]?.total || 0) + 1,
                blocks: (c[c.length - 1]?.blocks || 0)
              });
              return c;
            });
          }
          if (msg.type === 'unrecognized' && msg.payload) {
            setQuickStats(prev => ({ ...prev, intrusion: prev.intrusion + 1 }));
            setRecentIntrusions(prev => [
              {
                ts: msg.payload.created_at || new Date(),
                src: (msg.payload.telemetry || {}).remote_ip || 'unknown',
                tgt: (msg.payload.telemetry || {}).local_ip || 'unknown',
                type: 'Unrecognized'
              },
              ...prev
            ].slice(0, 10));
          }
          if (msg.type === 'network' && msg.payload) {
            setPieData(prev => {
              if (prev.length === 0) return prev;
              return [
                { ...prev[0], value: Math.max(1, (prev[0]?.value || 0) + 1) },
                prev[1],
                prev[2]
              ];
            });
          }
        }, (err) => {
          console.warn('SSE connection error:', err);
        });
      } catch (e) {
        console.warn('SSE unavailable:', e);
      }
    });

    return () => {
      mounted = false;
      if (sse && sse.close) sse.close();
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Stats card component
  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className={glass}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: `${color}15` }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 rounded-lg mb-3" style={{ background: `${palette.connections}15` }}>
        <Icon size={32} color={palette.connections} opacity={0.5} />
      </div>
      <h4 className="text-slate-300 font-medium mb-1">{title}</h4>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );

  // Section header component
  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && action}
    </div>
  );

  // Visited Websites Modal Component
  const VisitedWebsitesModal = ({ isOpen, onClose, userId }) => {
    if (!isOpen) return null;
    
    // Mock data - replace with actual API call if needed
    const websites = [
      { name: 'google.com', duration: '2h 35m' },
      { name: 'github.com', duration: '1h 20m' },
      { name: 'stackoverflow.com', duration: '45m' },
      { name: 'wikipedia.org', duration: '30m' }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className={`${glass} w-full max-w-md shadow-2xl`} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/30">
            <h3 className="text-lg font-semibold text-slate-100">Visited Websites</h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} color="#cbd5e1" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {websites.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p>No websites visited</p>
              </div>
            ) : (
              <div className="space-y-2">
                {websites.map((site, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-200 font-mono text-sm">{site.name}</p>
                      <p className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded">
                        {site.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const COLORS = [palette.connections, palette.threat, palette.intrusion];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${palette.bgA}, ${palette.bgB})` }}>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-sky-500 rounded-full"></div>
            </div>
            <p className="text-slate-300">Loading dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center flex-1">
          <div className={`${glass} p-6 max-w-md text-center`}>
            <AlertTriangle size={40} className="mx-auto mb-3" color={palette.intrusion} />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Error Loading Dashboard</h3>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
      <main className="flex-1 overflow-y-auto" style={{ opacity: 0.9 }}>
        <div className="p-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Intrusion Attempts" value={quickStats.intrusion} color={palette.intrusion} icon={AlertTriangle} />
            <StatCard title="Threats Detected" value={quickStats.threats} color={palette.threat} icon={ShieldOff} />
            <StatCard title="False Positives" value={quickStats.falsepos} color={palette.falsepos} icon={CheckCircle} />
            <StatCard title="Active Connections" value={quickStats.connections} color={palette.connections} icon={Wifi} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Threat Activity Chart */}
            <div className={`${glass} lg:col-span-2 p-5 transparent`}>
              <SectionHeader 
                title="Threat Activity" 
                subtitle="Weekly overview of detected threats and blocked attempts"
              />
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.intrusion} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={palette.intrusion} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.connections} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={palette.connections} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.2)" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke={palette.intrusion} fillOpacity={1} fill="url(#colorTotal)" name="Threats" />
                  <Area type="monotone" dataKey="blocks" stroke={palette.connections} fillOpacity={1} fill="url(#colorBlock)" name="Blocks" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/30">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Threat Rate</p>
                  <p className="text-lg font-bold text-slate-100">{((quickStats.threats/(quickStats.intrusion||1))*100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Block Rate</p>
                  <p className="text-lg font-bold text-slate-100">{((chartData.reduce((s,c)=>s+c.blocks,0)/(Math.max(1,chartData.reduce((s,c)=>s+c.total,0))))*100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">False Positives</p>
                  <p className="text-lg font-bold text-slate-100">{((quickStats.falsepos/(quickStats.intrusion||1))*100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Network Traffic Pie Chart */}
            <div className={`${glass} p-5 transparent`}>
              <SectionHeader 
                title="Network Traffic" 
                subtitle="Traffic classification"
              />
              {pieData.some(d => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} fill="#8884d8">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Incoming</span>
                      <span className="text-slate-100 font-semibold">{bandwidth.incoming} MB/s</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Outgoing</span>
                      <span className="text-slate-100 font-semibold">{bandwidth.outgoing} MB/s</span>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState icon={Wifi} title="No Traffic Data" message="Awaiting network activity data" />
              )}
            </div>
          </div>

          {/* Data Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Attacks */}
            <div className={`${glass} p-5 transparent`}>
              <SectionHeader 
                title="Top Attack Patterns" 
                subtitle="Most frequently detected attack types"
              />
              {topAttacks.length === 0 ? (
                <EmptyState icon={ShieldOff} title="No Attacks Detected" message="System operating normally" />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {topAttacks.map((attack) => (
                    <div key={attack.name} className="p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-200 truncate">{attack.name}</p>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-700/50 text-slate-300">{attack.count}</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ 
                            width: `${Math.round(attack.freq*100)}%`,
                            background: `linear-gradient(90deg, ${palette.threat}, ${palette.intrusion})`
                          }} 
                          className="h-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Intrusions */}
            <div className={`${glass} p-5 transparent`}>
              <SectionHeader 
                title="Recent Intrusions" 
                subtitle="Latest unrecognized network activity"
                action={
                  <button 
                    className="text-sm px-3 py-1 rounded-md bg-sky-500/20 text-black hover:bg-sky-500/30 transition-colors font-medium"
                    onClick={() => navigate('/processes')}
                  >
                    View All →
                  </button>
                }
              />
              {recentIntrusions.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No Intrusions" message="No recent suspicious activity detected" />
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white/5 border-b border-slate-700/30">
                      <tr>
                        <th className="text-left px-2 py-2 text-xs font-semibold text-slate-400">Timestamp</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold text-slate-400">Source IP</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold text-slate-400">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIntrusions.map((intrusion, idx) => (
                        <tr key={idx} className="border-b border-slate-700/20 hover:bg-white/5 transition-colors">
                          <td className="px-2 py-2 text-slate-300 text-xs">{new Date(intrusion.ts).toLocaleString()}</td>
                          <td className="px-2 py-2 text-slate-200 font-mono text-xs">{intrusion.src}</td>
                          <td className="px-2 py-2">
                            <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-300">
                              {intrusion.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Users Section */}
          <div className={`${glass} p-5`} style={{ marginBottom: '40px' }}>
            <SectionHeader 
              title="Registered Users" 
              subtitle="Active system users and their roles"
              action={
                <button 
                  className="text-sm px-3 py-1 rounded-md bg-emerald-500/20 text-black hover:bg-emerald-500/30 transition-colors font-medium"
                  onClick={() => navigate('/users')}
                >
                  Manage Users →
                </button>
              }
            />
            <div className="mb-4">
              <p className="text-sm text-slate-400">Total Users: <span className="font-semibold text-slate-200">{users.length === 0 ? 'None' : users.length}</span></p>
            </div>
            {users.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No Users Registered" message="No user accounts found in the system" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-slate-700/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">User ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Visited Websites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 8).map((user) => (
                      <tr key={user.id} className="border-b border-slate-700/20 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-slate-200 font-mono text-sm">{user.id}</td>
                        <td className="px-4 py-3 text-slate-200 font-mono text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              setSelectedUserWebsites(user.id);
                              setWebsitesModalOpen(true);
                            }}
                            className="text-sm px-3 py-1 rounded-md bg-blue-500/20 text-black hover:bg-blue-500/30 transition-colors font-medium"
                          >
                            View Websites
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 8 && (
                  <div className="p-4 text-center border-t border-slate-700/20">
                    <p className="text-sm text-slate-400">
                      Showing 8 of {users.length} users
                      <button onClick={() => navigate('/users')} className="ml-2 text-black hover:text-slate-300 font-medium">
                        View All
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Visited Websites Modal */}
        <VisitedWebsitesModal 
          isOpen={websitesModalOpen} 
          onClose={() => {
            setWebsitesModalOpen(false);
            setSelectedUserWebsites(null);
          }} 
          userId={selectedUserWebsites}
        />
      </main>
      )}
    </div>
  );
}

