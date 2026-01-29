import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AttackIntel(){
  const [types, setTypes] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('patterns');

  const [nameInput, setNameInput] = useState('');
  const [typeSelect, setTypeSelect] = useState('');
  const [pjson, setPjson] = useState('{}');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [typesRes, patternsRes, proposalsRes] = await Promise.all([
          api.get('/attack-intel/types').catch(() => ({ data: [] })),
          api.get('/attack-intel/patterns').catch(() => ({ data: [] })),
          api.get('/attack-intel/proposals').catch(() => ({ data: [] }))
        ]);
        setTypes(typesRes.data || []);
        setPatterns(patternsRes.data || []);
        setProposals(proposalsRes.data || []);
      } catch (err) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const addType = async (e) => {
    e.preventDefault();
    if (!nameInput) {
      setError('Type name required');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/attack-intel/types', { name: nameInput, description: '' });
      setNameInput('');
      const res = await api.get('/attack-intel/types');
      setTypes(res.data || []);
    } catch(err) { 
      setError(err?.response?.data?.detail || err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addPattern = async (e) => {
    e.preventDefault();
    if (!typeSelect) {
      setError('Select an attack type');
      return;
    }
    try {
      setSubmitting(true);
      const condition = JSON.parse(pjson);
      await api.post('/attack-intel/patterns', { 
        attack_type_id: typeSelect, 
        ...condition
      });
      setPjson('{}');
      setTypeSelect('');
      const res = await api.get('/attack-intel/patterns');
      setPatterns(res.data || []);
    } catch(err) { 
      setError(err?.response?.data?.detail || err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approveProposal = async (id) => {
    try {
      await api.post(`/attack-intel/proposals/${id}/approve`);
      const res = await api.get('/attack-intel/proposals');
      setProposals(res.data || []);
    } catch(err) { 
      setError(err?.response?.data?.detail || err?.message);
    }
  };

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading attack intelligence...</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Attack Intelligence</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>Manage threat patterns & proposals</p>
      </header>

      {error && (
        <div style={{ 
          backgroundColor: '#7f1d1d', 
          color: '#fca5a5', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        {['patterns', 'proposals', 'add'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              backgroundColor: tab === t ? '#0ea5e9' : '#0f172a',
              color: '#fff',
              border: `1px solid ${tab === t ? '#0ea5e9' : '#475569'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'patterns' && (
        <div>
          <h2 style={{marginBottom: '15px', color: '#fff'}}>Attack Patterns ({patterns.length})</h2>
          {patterns.length === 0 ? (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(148,163,184,0.1)',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              No patterns defined
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px'}}>
              {patterns.map(p => (
                <div key={p.id} style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.1)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{fontWeight: 'bold', marginBottom: '8px'}}>{p.process_name || 'Pattern ' + p.id}</div>
                  {p.cmdline_regex && <div style={{fontSize: '12px', color: '#94a3b8'}}>Regex: {p.cmdline_regex}</div>}
                  {p.ip_pattern && <div style={{fontSize: '12px', color: '#94a3b8'}}>IP: {p.ip_pattern}</div>}
                  {p.recommended_action && <div style={{fontSize: '12px', color: '#86efac'}}>Action: {p.recommended_action}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'proposals' && (
        <div>
          <h2 style={{marginBottom: '15px', color: '#fff'}}>Auto-Generated Proposals ({proposals.length})</h2>
          {proposals.length === 0 ? (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(148,163,184,0.1)',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              No proposals available
            </div>
          ) : (
            <div style={{display: 'grid', gap: '15px'}}>
              {proposals.map(pp => (
                <div key={pp.id} style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.1)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <div>
                      <div style={{fontWeight: 'bold'}}>{pp.name}</div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>{new Date(pp.created_at).toLocaleString()}</div>
                    </div>
                    <span style={{
                      backgroundColor: pp.status === 'APPROVED' ? '#065f46' : '#b45309',
                      color: pp.status === 'APPROVED' ? '#d1fae5' : '#fcd34d',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {pp.status}
                    </span>
                  </div>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#1e293b',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    maxHeight: '150px',
                    overflow: 'auto',
                    marginBottom: '10px'
                  }}>
                    {JSON.stringify(pp.pattern, null, 2)}
                  </pre>
                  {pp.status === 'PENDING' && (
                    <button
                      onClick={() => approveProposal(pp.id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <form onSubmit={addType} style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(148,163,184,0.1)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}>Add Attack Type</h3>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Type name (e.g., Port Scanning)"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: '4px',
                marginBottom: '10px'
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#64748b' : '#0ea5e9',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {submitting ? 'Adding...' : 'Add Type'}
            </button>
          </form>

          <form onSubmit={addPattern} style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(148,163,184,0.1)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}>Add Pattern</h3>
            <select
              value={typeSelect}
              onChange={e => setTypeSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: '4px',
                marginBottom: '10px'
              }}
            >
              <option value="">Select Attack Type</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <textarea
              value={pjson}
              onChange={e => setPjson(e.target.value)}
              placeholder={'{"process_name":"cmd.exe","cmdline_regex":".*powershell.*"}'}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: '4px',
                minHeight: '80px',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '10px'
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#64748b' : '#10b981',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {submitting ? 'Adding...' : 'Add Pattern'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}