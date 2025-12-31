import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    // validate password bytes length (bcrypt limit)
    const len = new TextEncoder().encode(password).length;
    if (len > 72) {
      setMessage("Password too long: must be 72 bytes or fewer when encoded in UTF-8");
      return;
    }

    try {
      await api.post("/users/", { email, password, role });
      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {message && <p>{message}</p>}
      <p>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}
