import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postOrder, getUserByDevice } from "../api";

export default function Item({ deviceId, registered, setRegistered }) {
  const UNIT_PRICE = 25;

  const [dayChoice, setDayChoice] = useState(null);
  const [slotChoice, setSlotChoice] = useState(null);
  const [showSlotOverlay, setShowSlotOverlay] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userRegistered, setUserRegistered] = useState(registered);

  const navigate = useNavigate?.() ?? null;

  useEffect(() => {
    async function check() {
      try {
        if (!deviceId) return;
        const u = await getUserByDevice(deviceId);
        setUserRegistered(!!u);
        if (u) {
          localStorage.setItem("registered", "1");
          setRegistered(true);
        }
      } catch (err) {
        console.warn("getUserByDevice failed:", err);
      }
    }
    check();
  }, [deviceId, setRegistered]);

  const firstOrderUsed = localStorage.getItem("firstDiscountUsed") === "1";
  const qtyDiscount = quantity > 5 ? 10 : 0;
  const regDiscount = userRegistered && !firstOrderUsed ? 10 : 0;
  const subtotal = UNIT_PRICE * quantity;
  const total = Math.max(0, subtotal - qtyDiscount - regDiscount);

  function chooseWhen(choice) {
    setDayChoice(choice);
    setShowSlotOverlay(true);
  }

  function chooseSlot(slot) {
    setSlotChoice(slot);
    setShowSlotOverlay(false);
  }

  async function confirmOrder() {
    if (!dayChoice || !slotChoice) {
      alert("தயவு செய்து தேதியும் நேரத்தையும் தேர்வு செய்யவும்.");
      return;
    }
    setConfirmVisible(false);
    setBusy(true);
    try {
      await postOrder({
        deviceId,
        quantity,
        instructions,
        date: dayChoice,
        slot: slotChoice,
        totalPrice: total,
      });
      if (!firstOrderUsed && userRegistered) {
        localStorage.setItem("firstDiscountUsed", "1");
      }
      setSuccessVisible(true);
      setTimeout(() => {
        goHome();
      }, 5000);
    } catch (err) {
      alert("ஆர்டர் சிக்கல்: " + (err.message || err));
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    if (navigate) navigate(-1);
    else window.location.hash = "#/";
  }
  function goHome() {
    setSuccessVisible(false);
    if (navigate) navigate("/");
    else window.location.hash = "#/";
  }

  const dayLabel =
    dayChoice === "today" ? "இன்று" : dayChoice === "tomorrow" ? "நாளை" : "";

  return (
    <div className="item-page">
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h1>எப்போது வேண்டும் என்பதைத் தேர்வு செய்யவும்?</h1>
      </div>

      <div className="item-container">
        {/* Delivery Time */}
        <div className="delivery-section">
          <h3>📅 Delivery Time</h3>
          <div className="time-options">
            <button
              className={`time-btn ${dayChoice === "today" ? "active" : ""}`}
              onClick={() => chooseWhen("today")}
            >
              <span className="time-icon">☀️</span>
              <span>இன்று</span>
            </button>
            <button
              className={`time-btn ${dayChoice === "tomorrow" ? "active" : ""}`}
              onClick={() => chooseWhen("tomorrow")}
            >
              <span className="time-icon">🌙</span>
              <span>நாளை</span>
            </button>
          </div>
          {dayChoice && slotChoice && (
            <div className="selected-time">
              ✓ {dayLabel} - {slotChoice === "morning" ? "காலை" : "மாலை"}
            </div>
          )}
        </div>

        {/* Product */}
        <div className="product-showcase">
          <div className="product-image-container">
            <div className="product-badge">Premium</div>
            <div className="product-image">🌾</div>
            <div className="image-glow" />
          </div>
          <h2 className="product-name">அரிசி மாவு</h2>
          <p className="product-description">Fresh, High Quality Rice Flour</p>
        </div>

        {/* Pricing */}
        <div className="pricing-card">
          <div className="price-header">
            <span>Unit Price</span>
            <span className="price-tag">₹{UNIT_PRICE}</span>
          </div>

          <div className="quantity-section">
            <label>எத்தனை வேண்டும் என்பதைத் தேர்வு செய்யவும்:</label>
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div className="qty-display">{quantity}</div>
              <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal ({quantity})</span>
              <span>₹{subtotal}</span>
            </div>
            {qtyDiscount > 0 && (
              <div className="price-row discount">
                <span>Quantity discount</span>
                <span>-₹{qtyDiscount}</span>
              </div>
            )}
            {regDiscount > 0 && (
              <div className="price-row discount">
                <span>Registration discount</span>
                <span>-₹{regDiscount}</span>
              </div>
            )}
            <div className="price-row total">
              <span>மொத்தம்</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="instructions-section">
            <label>குறிப்பு</label>
            <textarea
              placeholder="கூடுதல் குறிப்புகள்..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button className="order-btn" onClick={() => setConfirmVisible(true)}>
            <span>ஆர்டர் செய்</span> <span>🛒</span>
          </button>
        </div>
      </div>

      {/* Slot Modal */}
      {showSlotOverlay && (
        <div className="modal-overlay" onClick={() => setShowSlotOverlay(false)}>
          <div className="modal-content slot-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🕒 நேரத்தைத் தேர்வு செய்யவும்</h2>
            <p className="slot-desc">உங்களுக்கு விருப்பமான நேரத்தை தேர்வு செய்யுங்கள்</p>
            <div className="slot-options">
              <button className="slot-btn" onClick={() => chooseSlot("morning")}>
                🌅 <strong>காலை</strong>
                <span className="slot-time">6 AM - 12 PM</span>
              </button>
              <button className="slot-btn" onClick={() => chooseSlot("evening")}>
                🌆 <strong>மாலை</strong>
                <span className="slot-time">4 PM - 8 PM</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmVisible && (
        <div className="modal-overlay" onClick={() => setConfirmVisible(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">❓</div>
            <h2>நிச்சயமாக ஆர்டரை பதிவு செய்யலாமா?</h2>
            <div className="confirm-details">
              <p><strong>Quantity:</strong> {quantity}</p>
              <p><strong>Total:</strong> ₹{total}</p>
              <p><strong>Delivery:</strong> {dayLabel} - {slotChoice === "morning" ? "காலை" : "மாலை"}</p>
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmVisible(false)}>இல்லை</button>
              <button className="btn-confirm" onClick={confirmOrder} disabled={busy}>
                {busy ? "காத்திரு..." : "ஆம்"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successVisible && (
        <div className="modal-overlay" onClick={goHome}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-animation"><div className="checkmark">✓</div></div>
            <h2>உங்கள் ஆர்டர் வெற்றிகரமாக பெறப்பட்டது 🎉</h2>
            <p className="success-message">நன்றி! விரைவில் உங்களுக்கு வந்து சேர்க்கப்படும்.</p>
            <button className="btn-done" onClick={goHome}>சரி</button>
          </div>
        </div>
      )}
    </div>
  );
}
