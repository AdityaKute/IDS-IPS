import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Rules() {
  const [name, setName] = useState("");
  const [json, setJson] = useState("");
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

  const submit = async () => {
    try {
      await api.post("/rules", { name, rule_type: 'custom', condition: json ? JSON.parse(json) : {}, action: 'alert', severity: 'MEDIUM', is_active: true });
      alert("Rule saved");
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save rule');
    }
  };

  useEffect(() => {
    api.get('/rules').then(res => setRules(res.data)).catch(err => setError(err?.response?.data?.detail || err?.message));
  }, []);

  return (
    <div>
      <h2>Rules</h2>
      {error && <div style={{color:'red'}}>{error}</div>}

      <div style={{marginBottom:12}}>
        <input placeholder="Rule Name" onChange={e => setName(e.target.value)} />
        <textarea placeholder="JSON Rule" onChange={e => setJson(e.target.value)} />
        <button onClick={submit}>Save</button>
      </div>

      <h3>Existing Rules</h3>
      <ul>
        {rules.map(r => <li key={r.id}>{r.name} ({r.severity})</li>)}
      </ul>
    </div>
  );
}
