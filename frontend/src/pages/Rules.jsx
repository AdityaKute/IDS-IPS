import { useState } from "react";
import api from "../api/axios";

export default function Rules() {
  const [name, setName] = useState("");
  const [json, setJson] = useState("");

  const submit = async () => {
    await api.post("/rules", { name, json, enabled: true });
    alert("Rule saved");
  };

  return (
    <div>
      <h2>Rules</h2>
      <input placeholder="Rule Name" onChange={e => setName(e.target.value)} />
      <textarea placeholder="JSON Rule" onChange={e => setJson(e.target.value)} />
      <button onClick={submit}>Save</button>
    </div>
  );
}
