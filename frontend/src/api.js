const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export async function api(path, { method = "GET", body, form } = {}) {
  const t = localStorage.getItem("token");
  const headers = t ? { Authorization: `Bearer ${t}` } : {};
  if (body) headers["Content-Type"] = "application/json";
  let res;
  try { res = await fetch(BASE + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) }); }
  catch { throw new Error("Cannot reach the server. Please try again."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Something went wrong.");
  return data;
}
