import React from "react";

export default function Splash() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-circle" />
          <div className="logo-text">🌾</div>
        </div>
        <h1 className="splash-title">வரவேற்கிறோம்</h1>
        <div className="splash-loader">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      </div>
    </div>
  );
}