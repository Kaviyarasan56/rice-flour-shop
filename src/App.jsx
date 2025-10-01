// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Item from "./pages/Item";
import { ensureDeviceId, checkRegistered } from "./utils";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [deviceId] = useState(() => ensureDeviceId());
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  // Show splash for 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Check registration status
  useEffect(() => {
    async function check() {
      const isReg = await checkRegistered(deviceId);
      setRegistered(isReg);
    }
    check();
  }, [deviceId]);

  // Redirect to home only if still on splash
  useEffect(() => {
    if (!showSplash && window.location.pathname === "/") {
      navigate("/home");
    }
  }, [showSplash, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route
        path="/home"
        element={<Home deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
      <Route
        path="/item"
        element={<Item deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
      <Route
        path="*"
        element={<Home deviceId={deviceId} registered={registered} setRegistered={setRegistered} />}
      />
    </Routes>
  );
}
