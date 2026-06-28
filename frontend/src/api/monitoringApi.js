// src/api/monitoringApi.js
// Centralised API calls for the monitoring subsystem.
// All authenticated requests send the stored token automatically.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ─── Token helpers ────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("tbj_token") || "";
}
export function setToken(token) {
  localStorage.setItem("tbj_token", token);
}
export function clearToken() {
  localStorage.removeItem("tbj_token");
  localStorage.removeItem("tbj_user");
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("tbj_user") || "null"); }
  catch { return null; }
}
export function setUser(user) {
  localStorage.setItem("tbj_user", JSON.stringify(user));
}

// ─── HTTP helpers ─────────────────────────────────────────────
function authHeaders() {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body = {}, includeAuth = true) {
  const headers = includeAuth
    ? authHeaders()
    : { "Content-Type": "application/json" };
  const res = await fetch(`${BASE}${path}`, {
    method: "POST", headers, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`);
  return res.json();
}

async function patch(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API PATCH ${path} → ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`API DELETE ${path} → ${res.status}`);
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────
export const login  = (username, password) => post("/auth/login",  { username, password }, false);
export const logout = ()                   => post("/auth/logout",  {}, true);
export const verifyToken = ()              => get("/auth/verify");

// ─── Overview (StaffOverviewPage) ────────────────────────────
export const fetchOverview = () => get("/overview");

// ─── Monitoring ───────────────────────────────────────────────
export const fetchLive    = ()    => get("/monitoring/live");
export const fetchAlerts  = ()    => get("/monitoring/alerts");
export const resolveAlert = (id)  => patch(`/monitoring/alerts/${id}`, { status: "Resolved" });

// ─── Analytics ────────────────────────────────────────────────
export const fetchAnalytics = (filters) => get("/analytics", filters);

// ─── Visitors ─────────────────────────────────────────────────
export const fetchVisitors    = (filters) => get("/visitors", filters);
export const fetchVisitorById = (id)      => get(`/visitors/${id}`);

// ─── Reports ──────────────────────────────────────────────────
export const fetchReports    = ()     => get("/reports");
export const generateReport  = (body) => post("/reports/generate", body);
export const deleteReport    = (id)   => del(`/reports/${id}`);
