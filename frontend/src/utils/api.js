import axios from "axios";

// Base URL API — STEP 10 (same-origin proxy):
//   Production (Vercel): VITE_API_URL="/api" → direwrite vercel.json ke backend,
//   sehingga browser selalu bicara ke origin frontend (cookie SameSite=Strict tetap valid).
//   Tidak ada fallback "http://localhost:5000" di production build.
//   Development: /api dilayani proxy Vite (vite.config.js → http://localhost:5000),
//   atau override via frontend/.env VITE_API_URL bila diperlukan.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
    //   window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;