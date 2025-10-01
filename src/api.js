// Centralized API calls
export const API_BASE = "https://rice-flour-backend-production.up.railway.app/api";

export async function postOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUserByDevice(deviceId) {
  const res = await fetch(`${API_BASE}/users/by-device/${encodeURIComponent(deviceId)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
