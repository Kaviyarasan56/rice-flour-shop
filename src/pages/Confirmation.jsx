import React from "react";
import { useParams, useNavigate } from "react-router-dom";

function Confirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Order Placed Successfully!</h2>
      <p>Your order ID is: <strong>{id}</strong></p>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

export default Confirmation;
