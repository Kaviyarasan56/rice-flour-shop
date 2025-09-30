import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Item() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    quantity: 1,
    instructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://rice-flour-backend-production.up.railway.app/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const data = await res.json();
      navigate(`/confirmation/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Order Rice Flour</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <input
          type="text"
          name="customerName"
          placeholder="Your Name"
          value={form.customerName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <textarea
          name="instructions"
          placeholder="Special Instructions"
          value={form.instructions}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Item;
