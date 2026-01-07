import axios from "axios";
import { API_BASE } from "./config";
import { logout } from "../auth/auth";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 and redirect to landing page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      logout();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
