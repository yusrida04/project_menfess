const API_BASE_URL = "http://localhost:8000";

export function anonToken() {
  let t = localStorage.getItem("anon_token");
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem("anon_token", t);
  }
  return t;
}

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Anon-Token": anonToken(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Terjadi kesalahan");
  }
  return res.json();
}