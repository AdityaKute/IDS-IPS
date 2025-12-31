import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Processes() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/processes/recent").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Process Events</h2>
      <ul>
        {data.map(p => (
          <li key={p.id}>{p.process_name} ({p.event_type})</li>
        ))}
      </ul>
    </div>
  );
}
