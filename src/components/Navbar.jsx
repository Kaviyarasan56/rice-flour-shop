import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">Rice Flour Shop</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/item">Order Item</Link>
      </div>
    </nav>
  );
}

export default Navbar;
