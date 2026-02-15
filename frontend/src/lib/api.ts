import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // important for refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Access token stored in memory (redux) — you should pass it via header when available
export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Optional: interceptor to try refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      await api.post("/auth/refresh");

      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
