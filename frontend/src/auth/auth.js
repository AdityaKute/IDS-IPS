export const login = (token) => {
  localStorage.setItem("token", token);
};

export const setRole = (role) => {
  if (role) localStorage.setItem("role", role);
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
