import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProtectedRoute({ requiredRole = null }) {
  const [authorized, setAuthorized] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthorized(false);
      return;
    }

    const checkRole = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
        
        if (requiredRole) {
          setAuthorized(response.data.role?.name === requiredRole);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setAuthorized(false);
      }
    };

    checkRole();
  }, [requiredRole]);

  if (authorized === null) {
    return <div style={{ padding: '20px', color: '#fff' }}>Checking authorization...</div>;
  }

  if (!authorized) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
