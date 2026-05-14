// src/hooks/useAuth.js

export default function useAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" or "student"

  return {
    isAuthenticated: !!token,
    role: role || null,
  };
}
