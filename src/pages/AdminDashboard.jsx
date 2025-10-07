import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8080/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [filterStatus, searchTerm]);

  async function loadData() {
    setLoading(true);
    setError("");
    
    try {
      // Load orders
      let url = `${BASE_URL}/admin/orders?`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
      
      const ordersRes = await fetch(url);
      if (!ordersRes.ok) {
        throw new Error(`Failed to load orders: ${ordersRes.status}`);
      }
      const ordersData = await ordersRes.json();
      setOrders(ordersData || []);

      // Load analytics
      const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`);
      if (!analyticsRes.ok) {
        throw new Error(`Failed to load analytics: ${analyticsRes.status}`);
      }
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("தரவை ஏற்ற முடியவில்லை: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`${BASE_URL}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await loadData();
        alert("ஆர்டர் நிலை புதுப்பிக்கப்பட்டது!");
      } else {
        const errorText = await res.text();
        alert("நிலை புதுப்பிக்க முடியவில்லை: " + errorText);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("புதுப்பிப்பு தோல்வி: " + err.message);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "PENDING": return "#ff9800";
      case "PROCESSING": return "#2196f3";
      case "OUT_FOR_DELIVERY": return "#9c27b0";
      case "DELIVERED": return "#4caf50";
      case "CANCELLED": return "#f44336";
      default: return "#999";
    }
  }

  function getPaymentBadgeClass(status) {
    switch (status) {
      case "PAID": return "paid";
      case "COD_PENDING": return "cod_pending";
      case "PENDING": return "pending";
      case "FAILED": return "failed";
      default: return "";
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("ta-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading && orders.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>நிர்வாக குழு ஏற்றுகிறது...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1>நிர்வாக குழு</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>{error}</h2>
          <button className="btn-primary" onClick={loadData}>
            மீண்டும் முயற்சிக்கவும்
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>நிர்வாக குழு</h1>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h3>{analytics.ordersToday || 0}</h3>
              <p>இன்றைய ஆர்டர்கள்</p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>{analytics.ordersThisWeek || 0}</h3>
              <p>இந்த வாரம்</p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>{analytics.totalOrders || 0}</h3>
              <p>மொத்த ஆர்டர்கள்</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">அனைத்து நிலைகள்</option>
          <option value="PENDING">நிலுவையில்</option>
          <option value="PROCESSING">செயலாக்கம்</option>
          <option value="OUT_FOR_DELIVERY">டெலிவரிக்கு</option>
          <option value="DELIVERED">வழங்கப்பட்டது</option>
          <option value="CANCELLED">ரத்து செய்யப்பட்டது</option>
        </select>

        <input
          type="text"
          placeholder="ஆர்டர்களை தேடுங்கள்..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>ஆர்டர்கள் இல்லை</h2>
            <p>தேடல் அல்லது வடிகட்டிக்கு பொருந்தும் ஆர்டர்கள் இல்லை</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>வாடிக்கையாளர்</th>
                <th>தொலைபேசி</th>
                <th>அளவு</th>
                <th>மொத்தம்</th>
                <th>தேதி/நேரம்</th>
                <th>நிலை</th>
                <th>பணம் செலுத்தல்</th>
                <th>செயல்கள்</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user?.name || "விருந்தினர்"}</td>
                  <td>{order.user?.phone || "-"}</td>
                  <td>{order.quantity} kg</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    {order.date === 'today' ? 'இன்று' : 'நாளை'} / {order.slot === 'morning' ? 'காலை' : 'மாலை'}
                    <br />
                    <small>{formatDate(order.createdAt)}</small>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                    {order.paymentMethod && (
                      <><br /><small>{order.paymentMethod}</small></>
                    )}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}