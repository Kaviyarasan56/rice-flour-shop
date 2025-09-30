import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleVisitItem = () => {
    navigate("/item");
  };

  return (
    <div className="container">
      <h1>Welcome to Rice Flour Shop</h1>
      <p>We provide high-quality rice flour for all your cooking needs.</p>
      <button onClick={handleVisitItem}>Visit Item</button>
    </div>
  );
}

export default Home;
