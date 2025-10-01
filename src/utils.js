export function ensureDeviceId() {
    let d = localStorage.getItem("device_id");
    if (!d) {
      if (window.crypto && crypto.randomUUID) d = crypto.randomUUID();
      else d = "dev-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("device_id", d);
    }
    return d;
  }
  
  import { getUserByDevice } from "./api";
  export async function checkRegistered(deviceId) {
    try {
      const user = await getUserByDevice(deviceId);
      return !!user;
    } catch {
      return false;
    }
  }
  