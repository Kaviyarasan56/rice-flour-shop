const BASE_URL = "http://localhost:8080/api";

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export async function getUserByDevice(deviceId) {
  const res = await fetch(`${BASE_URL}/users/by-device/${deviceId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createPaymentOrder(data) {
  const res = await fetch(`${BASE_URL}/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Payment creation failed");
  return res.json();
}

export async function postOrder(data) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}