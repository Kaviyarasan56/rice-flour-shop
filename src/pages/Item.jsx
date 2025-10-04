import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postOrder, getUserByDevice, createPaymentOrder } from "../api";

export default function Item({ deviceId, registered, setRegistered }) {
  const UNIT_PRICE = 30;

  const [dayChoice, setDayChoice] = useState(null);
  const [slotChoice, setSlotChoice] = useState(null);
  const [showSlotOverlay, setShowSlotOverlay] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userRegistered, setUserRegistered] = useState(registered);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);

  const navigate = useNavigate?.() ?? null;

  // ✅ Load Razorpay SDK dynamically if not present
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => alert("Razorpay SDK load failed. Please refresh.");
    document.body.appendChild(script);
  }, []);

  // ✅ Fetch user info by device ID
  useEffect(() => {
    async function check() {
      try {
        if (!deviceId) return;
        const u = await getUserByDevice(deviceId);
        if (u) {
          setUserRegistered(true);
          setUserName(u.name || "");
          setUserPhone(u.phone || "");
          localStorage.setItem("registered", "1");
          setRegistered(true);
        } else {
          alert("முதலில் பதிவு செய்யவும் / Please register first");
          goHome();
        }
      } catch (err) {
        console.warn("getUserByDevice failed:", err);
      }
    }
    check();
  }, [deviceId, setRegistered]);

  const firstOrderUsed = localStorage.getItem("firstDiscountUsed") === "1";
  const qtyDiscount = quantity > 5 ? quantity * 0.5 : 0;
  const regDiscount = userRegistered && !firstOrderUsed ? 5 : 0;
  const subtotal = UNIT_PRICE * quantity;
  const total = Math.max(0, subtotal - qtyDiscount - regDiscount);

  function chooseWhen(choice) {
    const now = new Date();
    const hour = now.getHours();

    if (choice === "today") {
      if (slotChoice === "morning") {
        alert("காலை ஸ்லாட் முடிந்துவிட்டது (12 AM க்கு பிறகு)");
        return;
      }
      if (slotChoice === "evening" && hour >= 10) {
        alert("மாலை ஸ்லாட் முடிந்துவிட்டது (10 AM க்கு பிறகு)");
        return;
      }
    }

    setDayChoice(choice);
    setShowSlotOverlay(true);
  }

  function chooseSlot(slot) {
    const now = new Date();
    const hour = now.getHours();

    if (dayChoice === "today") {
      if (slot === "morning" && hour >= 0) {
        alert("காலை ஸ்லாட் முடிந்துவிட்டது");
        return;
      }
      if (slot === "evening" && hour >= 10) {
        alert("மாலை ஸ்லாட் முடிந்துவிட்டது");
        return;
      }
    }

    setSlotChoice(slot);
    setShowSlotOverlay(false);
  }

  async function confirmOrder() {
    if (!dayChoice || !slotChoice) {
      alert("தயவு செய்து தேதியும் நேரத்தையும் தேர்வு செய்யவும்.");
      return;
    }

    if (!userRegistered) {
      alert("முதலில் பதிவு செய்யவும்");
      goHome();
      return;
    }

    setConfirmVisible(false);

    if (paymentMethod === "UPI") {
      await handleUPIPayment();
    } else {
      await handleCODOrder();
    }
  }

  async function handleUPIPayment() {
    if (!razorpayReady || !window.Razorpay) {
      alert("Razorpay SDK இன்னும் ஏற்றப்படவில்லை. தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்.");
      return;
    }
  
    setBusy(true);
    try {
      const paymentData = await createPaymentOrder({
        deviceId,
        quantity,
        date: dayChoice,
        slot: slotChoice,
        totalAmount: total,
      });
  
      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: "INR",
        name: "அரிசி மாவு ஆர்டர்",
        description: `${dayChoice} - ${slotChoice}`,
        order_id: paymentData.orderId,
        prefill: {
          name: userName,
          contact: userPhone,
        },
  
        // ✅ Enable UPI Intent Flow
        method: { upi: true },
        upi: {
          flow: "intent", // shows installed UPI apps
        },
  
        handler: async function (response) {
          console.log("Payment success:", response);
          await placeOrderWithPayment(response);
        },
  
        modal: {
          ondismiss: function () {
            setBusy(false);
            alert("பேமெண்ட் ரத்து செய்யப்பட்டது");
          },
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp = new window.Razorpay(options);
  
      // ✅ Optional: listen to failure
      rzp.on("payment.failed", function (response) {
        console.warn("Payment failed:", response.error);
        alert("பேமெண்ட் தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
        setBusy(false);
      });
  
      rzp.open();
    } catch (err) {
      console.error("Payment creation error:", err);
      setBusy(false);
      alert("பேமெண்ட் உருவாக்கம் தோல்வி: " + err.message);
    }
  }
  
  async function placeOrderWithPayment(paymentResponse) {
    try {
      await postOrder({
        deviceId,
        quantity,
        instructions,
        date: dayChoice,
        slot: slotChoice,
        totalPrice: total,
        paymentMethod: "UPI",
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      if (!firstOrderUsed && userRegistered) {
        localStorage.setItem("firstDiscountUsed", "1");
      }

      setBusy(false);
      setSuccessVisible(true);
      setTimeout(() => goHome(), 5000);
    } catch (err) {
      setBusy(false);
      alert("ஆர்டர் சிக்கல்: " + err.message);
    }
  }

  async function handleCODOrder() {
    setBusy(true);
    try {
      await postOrder({
        deviceId,
        quantity,
        instructions,
        date: dayChoice,
        slot: slotChoice,
        totalPrice: total,
        paymentMethod: "COD",
      });

      if (!firstOrderUsed && userRegistered) {
        localStorage.setItem("firstDiscountUsed", "1");
      }

      setSuccessVisible(true);
      setTimeout(() => goHome(), 5000);
    } catch (err) {
      alert("ஆர்டர் சிக்கல்: " + err.message);
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
  const slotLabel =
    slotChoice === "morning" ? "காலை" : slotChoice === "evening" ? "மாலை" : "";

  return (
    <div className="item-page">
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h1>எப்போது வேண்டும் எனபதைத் தேர்வு செய்யவும்?</h1>
      </div>

      <div className="item-container">
        {/* Delivery section */}
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
              ✓ {dayLabel} - {slotLabel}
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
            <label>எத்தனை வேண்டும் எனபதைத் தேர்வு செய்யவும்:</label>
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
                <span>Bulk discount (₹0.5/unit)</span>
                <span>-₹{qtyDiscount.toFixed(2)}</span>
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
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="payment-method-section">
            <label>Payment Method:</label>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Cash on Delivery (இயல்பான)</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 UPI (Razorpay)</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="instructions-section">
            <label>குறிப்பு</label>
            <textarea
              placeholder="கூடுதல் குறிப்புகள்..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button
            className="order-btn"
            onClick={() => setConfirmVisible(true)}
            disabled={busy}
          >
            <span>{busy ? "காத்திரு..." : "ஆர்டர் செய்"}</span> <span>🛒</span>
          </button>
        </div>
      </div>

      {/* Slot selection modal */}
      {showSlotOverlay && (
        <div className="modal-overlay" onClick={() => setShowSlotOverlay(false)}>
          <div
            className="modal-content slot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🕒 நேரத்தைத் தேர்வு செய்யவும்</h2>
            <p className="slot-desc">
              உங்களுக்கு விருப்பமான நேரத்தை தேர்வு செய்யுங்கள்
            </p>
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

      {/* Confirmation modal */}
      {confirmVisible && (
        <div className="modal-overlay" onClick={() => setConfirmVisible(false)}>
          <div
            className="modal-content confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">❓</div>
            <h2>நிச்சயமாக ஆர்டரை பதிவு செய்யலாமா?</h2>
            <div className="confirm-details">
              <p>
                <strong>Quantity:</strong> {quantity}
              </p>
              <p>
                <strong>Total:</strong> ₹{total.toFixed(2)}
              </p>
              <p>
                <strong>Delivery:</strong> {dayLabel} - {slotLabel}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                {paymentMethod === "UPI"
                  ? "UPI (Razorpay)"
                  : "Cash on Delivery"}
              </p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmVisible(false)}
              >
                இல்லை
              </button>
              <button
                className="btn-confirm"
                onClick={confirmOrder}
                disabled={busy}
              >
                {busy ? "காத்திர..." : "ஆம்"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {successVisible && (
        <div className="modal-overlay" onClick={goHome}>
          <div
            className="modal-content success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="success-animation">
              <div className="checkmark">✓</div>
            </div>
            <h2>உங்கள் ஆர்டர் வெற்றிகரமாக பெறப்பட்டது 🎉</h2>
            <p className="success-message">
              நன்றி! விரைவில் உங்களுக்கு வந்து சேர்க்கப்படும்.
            </p>
            <button className="btn-done" onClick={goHome}>
              சரி
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
