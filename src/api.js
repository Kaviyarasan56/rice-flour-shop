
//const BASE_URL = "http://localhost:8080/api";
const BASE_URL = "https://rice-flour-backend-production.up.railway.app";

export async function registerUser(data) {
  try {
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
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function getUserByDevice(deviceId) {
  try {
    const res = await fetch(`${BASE_URL}/users/by-device/${deviceId}`);
    
    // 404 means user doesn't exist (not registered)
    if (res.status === 404) {
      return null;
    }
    
    // Any other error (500, network failure, etc.) should throw
    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

export async function createPaymentOrder(data) {
  try {
    const res = await fetch(`${BASE_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Payment creation failed");
    }
    
    return res.json();
  } catch (error) {
    console.error("Payment creation error:", error);
    throw error;
  }
}

export async function postOrder(data) {
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Order submission failed");
    }
    
    return res.json();
  } catch (error) {
    console.error("Order submission error:", error);
    throw error;
  }
}

export async function getUserOrders(deviceId) {
  try {
    const res = await fetch(`${BASE_URL}/user-orders/${deviceId}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Get orders error:", error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const res = await fetch(`${BASE_URL}/orders`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get all orders error:", error);
    return [];
  }
}

