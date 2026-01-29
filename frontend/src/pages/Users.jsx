import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "member"
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      navigate("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/");
      setUsers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/users/", {
        email: formData.email,
        password: formData.password,
        role_id: formData.role === "admin" ? 1 : 2
      });
      setFormData({ email: "", password: "", role: "member" });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentUser) {
    return <div style={{ padding: '20px', color: '#fff' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', color: '#cbd5e1', backgroundColor: '#020617', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#fff' }}>User Management</h1>
        <p style={{ marginTop: '5px', color: '#94a3b8' }}>Admin only - manage employees & monitoring access</p>
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

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#0ea5e9',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showForm ? 'Cancel' : 'Register New User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateUser} style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(148,163,184,0.1)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: '4px'
              }}
            >
              <option value="member">Employee (Member)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: submitting ? '#64748b' : '#10b981',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      <div>
        <h2 style={{ marginBottom: '15px', color: '#fff' }}>Registered Users ({users.length})</h2>
        {users.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>No users registered yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: user.role?.name === 'Admin' ? '#7c2d12' : '#1e3a8a',
                      color: user.role?.name === 'Admin' ? '#fed7aa' : '#93c5fd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {user.role?.name || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      color: user.is_active ? '#86efac' : '#f87171'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>
                    {new Date(user.created_at).toLocaleString()}
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
