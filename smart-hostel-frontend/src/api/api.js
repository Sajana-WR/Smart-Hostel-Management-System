import axios from "axios";

// ✅ Empty baseURL: works for both local dev (via Vite proxy) and Docker (via nginx proxy)
//    - Local dev: requests go through Vite's dev server at localhost:5173
//    - Docker: nginx proxies /api/ to the backend container
const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

// ✅ attach token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ optional: if unauthorized, clear token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("surveyCompleted");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
    }
    return Promise.reject(err);
  }
);

export default api;