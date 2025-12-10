import axios from 'axios';

const API_BASE = process.env.REACT_APP_API || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

export default api;
