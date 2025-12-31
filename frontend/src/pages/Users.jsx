import { useState } from "react";
import api from "../api/axios";

export default function Users() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const createUser = async () => {
    await api.post("/users", { username, password, role: "member" });
    alert("User created");
  };

  return (
    <div>
      <h2>Create User</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={createUser}>Create</button>
    </div>
  );
}
