import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Item from "./pages/Item";
import AdminDashboard from "./pages/AdminDashboard";
import MyOrders from "./pages/MyOrders";
import Confirmation from "./pages/Confirmation";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [deviceId, setDeviceId] = useState("");
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  // Generate or retrieve device ID
  useEffect(() => {
    let did = localStorage.getItem("deviceId");
    if (!did) {
      did = "dev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("deviceId", did);
    }
    setDeviceId(did);

    // Check registration status on app load
    if (localStorage.getItem("registered") === "1") {
      setRegistered(true);
    }
  }, []);

  // Show splash for 2 seconds then navigate to home
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, navigate]);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Home deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
      <Route
        path="/home"
        element={<Home deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
      <Route
        path="/item"
        element={<Item deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
      <Route
        path="/admin"
        element={<AdminDashboard />}
      />
      <Route
        path="/my-orders"
        element={<MyOrders deviceId={deviceId} registered={registered} />}
      />
      <Route
        path="/confirmation"
        element={<Confirmation />}
      />
      <Route
        path="*"
        element={<Home deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
    </Routes>
  );
}