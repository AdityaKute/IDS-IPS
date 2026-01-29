import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Rules() {
  const [name, setName] = useState("");
  const [json, setJson] = useState("{}");
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const condition = JSON.parse(json);
      await api.post("/rules", { 
        name, 
        rule_type: 'custom', 
        condition, 
        action: 'alert', 
        severity: 'MEDIUM', 
        is_active: true 
      });
      setName("");
      setJson("{}");
      await fetchRules();
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save rule');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await api.get('/rules');
      setRules(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message);
    }
  };

  useEffect(() => {
    fetchRules().finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Loading rules...</div>;

  return (
    <div style={{padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh'}}>
      <header style={{marginBottom: '30px'}}>
        <h1 style={{color: '#fff'}}>Detection Rules</h1>
        <p style={{marginTop: '5px', color: '#94a3b8'}}>Manage threat detection rules</p>
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

      <form onSubmit={submit} style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(148,163,184,0.1)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{marginBottom: '15px', color: '#fff'}}>Create New Rule</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Rule Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Condition (JSON)</label>
          <textarea
            value={json}
            onChange={e => setJson(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
              borderRadius: '4px',
              minHeight: '100px',
              fontFamily: 'monospace'
            }}
            required
          />
          <p style={{fontSize: '12px', color: '#94a3b8', marginTop: '5px'}}>
            Example: {'{'}'"process_name":"cmd.exe"{'}'}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#64748b' : '#0ea5e9',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Saving...' : 'Create Rule'}
        </button>
      </form>

      <div>
        <h2 style={{marginBottom: '15px', color: '#fff'}}>Active Rules ({rules.length})</h2>
        {rules.length === 0 ? (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(148,163,184,0.1)',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            No rules defined yet
          </div>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(148,163,184,0.1)'}}>
                <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Name</th>
                <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Type</th>
                <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Severity</th>
                <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Status</th>
                <th style={{textAlign: 'left', padding: '12px', color: '#94a3b8'}}>Created</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} style={{borderBottom: '1px solid rgba(148,163,184,0.05)'}}>
                  <td style={{padding: '12px'}}>{r.name}</td>
                  <td style={{padding: '12px'}}>{r.rule_type}</td>
                  <td style={{padding: '12px'}}>
                    <span style={{
                      backgroundColor: r.severity === 'HIGH' ? '#7f1d1d' : r.severity === 'MEDIUM' ? '#b45309' : '#065f46',
                      color: r.severity === 'HIGH' ? '#fca5a5' : r.severity === 'MEDIUM' ? '#fcd34d' : '#d1fae5',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {r.severity}
                    </span>
                  </td>
                  <td style={{padding: '12px'}}>
                    <span style={{color: r.is_active ? '#86efac' : '#f87171'}}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{padding: '12px', color: '#94a3b8', fontSize: '12px'}}>
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
