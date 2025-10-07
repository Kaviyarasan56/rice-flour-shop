import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserOrders } from "../api";

export default function MyOrders({ deviceId, registered }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is registered
    if (!registered) {
      alert("முதலில் பதிவு செய்யவும்!");
      navigate("/");
      return;
    }

    loadOrders();
  }, [deviceId, registered, navigate]);

  async function loadOrders() {
    if (!deviceId) {
      setError("Device ID இல்லை");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserOrders(deviceId);
      setOrders(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("ஆர்டர்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setLoading(false);
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

  function getStatusText(status) {
    switch (status) {
      case "PENDING": return "நிலுவையில்";
      case "PROCESSING": return "செயலாக்கம்";
      case "OUT_FOR_DELIVERY": return "டெலிவரிக்கு";
      case "DELIVERED": return "வழங்கப்பட்டது";
      case "CANCELLED": return "ரத்து செய்யப்பட்டது";
      default: return status;
    }
  }

  function getPaymentStatusText(status) {
    switch (status) {
      case "PAID": return "செலுத்தப்பட்டது";
      case "COD_PENDING": return "COD - நிலுவையில்";
      case "PENDING": return "நிலுவையில்";
      case "FAILED": return "தோல்வி";
      default: return status;
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("ta-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1>என் ஆர்டர்கள்</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>ஏற்றுகிறது...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1>என் ஆர்டர்கள்</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>{error}</h2>
          <button className="btn-primary" onClick={loadOrders}>
            மீண்டும் முயற்சிக்கவும்
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>என் ஆர்டர்கள்</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>ஆர்டர்கள் இல்லை</h2>
          <p>நீங்கள் இன்னும் எந்த ஆர்டரும் செய்யவில்லை</p>
          <button className="btn-primary" onClick={() => navigate("/item")}>
            இப்போது ஆர்டர் செய்யுங்கள்
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>ஆர்டர் #{order.id}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-price">₹{order.totalPrice}</div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span>அளவு:</span>
                  <strong>{order.quantity} kg</strong>
                </div>
                <div className="detail-row">
                  <span>தேதி:</span>
                  <strong>{order.date === 'today' ? 'இன்று' : 'நாளை'}</strong>
                </div>
                <div className="detail-row">
                  <span>நேரம்:</span>
                  <strong>{order.slot === 'morning' ? 'காலை' : 'மாலை'}</strong>
                </div>
                <div className="detail-row">
                  <span>நிலை:</span>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span>பணம் செலுத்தல்:</span>
                  <strong>{getPaymentStatusText(order.paymentStatus)}</strong>
                </div>
                {order.paymentMethod && (
                  <div className="detail-row">
                    <span>பணம் செலுத்தும் முறை:</span>
                    <strong>{order.paymentMethod === 'COD' ? '💵 COD' : '📱 Online'}</strong>
                  </div>
                )}
                {order.instructions && (
                  <div className="detail-row">
                    <span>குறிப்புகள்:</span>
                    <strong>{order.instructions}</strong>
                  </div>
                )}
              </div>

              {/* Order Timeline */}
              <div className="order-timeline">
                <div className={`timeline-step ${order.status !== 'CANCELLED' ? 'completed' : ''}`}>
                  <div className="step-icon">✓</div>
                  <div className="step-content">
                    <h4>ஆர்டர் செய்யப்பட்டது</h4>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className={`timeline-step ${['PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
                  <div className="step-icon">⚙️</div>
                  <div className="step-content">
                    <h4>செயலாக்கம்</h4>
                    <p>{order.processingAt ? formatDate(order.processingAt) : 'நிலுவையில்'}</p>
                  </div>
                </div>

                <div className={`timeline-step ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
                  <div className="step-icon">🚚</div>
                  <div className="step-content">
                    <h4>டெலிவரிக்கு</h4>
                    <p>{order.outForDeliveryAt ? formatDate(order.outForDeliveryAt) : 'நிலுவையில்'}</p>
                  </div>
                </div>

                <div className={`timeline-step ${order.status === 'DELIVERED' ? 'completed' : ''} ${order.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                  <div className="step-icon">{order.status === 'CANCELLED' ? '✗' : '✓'}</div>
                  <div className="step-content">
                    <h4>{order.status === 'CANCELLED' ? 'ரத்து செய்யப்பட்டது' : 'வழங்கப்பட்டது'}</h4>
                    <p>
                      {order.status === 'DELIVERED' && order.deliveredAt 
                        ? formatDate(order.deliveredAt) 
                        : order.status === 'CANCELLED' && order.cancelledAt
                        ? formatDate(order.cancelledAt)
                        : 'நிலுவையில்'}
                    </p>
                  </div>
                </div>
              </div>

              {order.statusNote && (
                <div className="status-note">
                  <strong>குறிப்பு:</strong> {order.statusNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}