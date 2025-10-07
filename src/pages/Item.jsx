import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser, getUserByDevice } from "../api";

export default function Home({ deviceId, registered, setRegistered }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ name: "", village: "", phone: "", otherInfo: "" });
  const [error, setError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const navigate = useNavigate?.() ?? null;

  useEffect(() => {
    async function checkReg() {
      if (!deviceId) {
        setChecking(false);
        return;
      }

      try {
        const user = await getUserByDevice(deviceId);
        
        if (user) {
          localStorage.setItem("registered", "1");
          setRegistered(true);
          setShowSuccessBanner(true);
          
          setTimeout(() => {
            setShowSuccessBanner(false);
          }, 5000);
        } else {
          localStorage.removeItem("registered");
          localStorage.removeItem("firstDiscountUsed");
          setRegistered(false);
        }
      } catch (err) {
        console.error("Failed to check registration:", err);
        alert("Cannot verify registration status. Please check your connection.");
      } finally {
        setChecking(false);
      }
    }
    
    checkReg();
  }, [deviceId, setRegistered]);

  async function submitRegistration(e) {
    e.preventDefault();
    setError("");
    
    if (!form.name || !form.phone) {
      setError("பெயர் மற்றும் தொலைபேசி எண்ணை கொடுக்கவும்.");
      return;
    }
    
    setLoading(true);
    
    try {
      const user = await registerUser({ ...form, deviceId });
      
      if (user && user.id) {
        localStorage.setItem("registered", "1");
        setRegistered(true);
        setShowForm(false);
        setShowSuccessBanner(true);
        
        setTimeout(() => {
          setShowSuccessBanner(false);
        }, 5000);
      } else {
        throw new Error("Registration failed - no user returned");
      }
    } catch (err) {
      if (err.message.includes("ஏற்கனவே பதிவு")) {
        setError("இந்த தொலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.");
      } else {
        setError("பதிவில் தவறு: " + (err.message || err));
      }

import { createPaymentOrder, postOrder } from "../api";

const UNIT_PRICE = 30;
const FIRST_ORDER_DISCOUNT = 5;

export default function Item({ deviceId, registered }) {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [useFirstDiscount, setUseFirstDiscount] = useState(false);
  const [firstDiscountAvailable, setFirstDiscountAvailable] = useState(false);
  
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is registered
    if (!registered) {
      alert("முதலில் பதிவு செய்யவும்!");
      navigate("/");
      return;
    }

    // Check if first discount is available
    const discountUsed = localStorage.getItem("firstDiscountUsed");
    if (discountUsed !== "1") {
      setFirstDiscountAvailable(true);
      setUseFirstDiscount(true);
    }
  }, [registered, navigate]);

  function incrementQty() {
    setQuantity(prev => prev + 1);
  }

  function decrementQty() {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }

  function calculateTotal() {
    let subtotal = quantity * UNIT_PRICE;
    let discount = 0;
    
    if (firstDiscountAvailable && useFirstDiscount) {
      discount = FIRST_ORDER_DISCOUNT;
    }
    
    return Math.max(0, subtotal - discount);
  }

  function handleOrderClick() {
    if (!selectedDate || !selectedSlot) {
      alert("தயவுசெய்து தேதி மற்றும் நேரத்தை தேர்ந்தெடுக்கவும்!");
      return;
    }
    setShowConfirmModal(true);
  }

  function handleDateSelect(date) {
    setSelectedDate(date);
  }

  function handleSlotSelect(slot) {
    setSelectedSlot(slot);
    setShowSlotModal(false);
  }

  async function confirmOrder() {
    if (!deviceId) {
      alert("Device ID இல்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
      return;
    }

    setLoading(true);

    try {
      const totalPrice = calculateTotal();

      if (paymentMethod === "UPI") {
        // Create Razorpay order
        const paymentData = {
          deviceId,
          quantity,
          date: selectedDate,
          slot: selectedSlot,
          totalAmount: totalPrice
        };

        const razorpayOrder = await createPaymentOrder(paymentData);

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: razorpayOrder.keyId,
            amount: razorpayOrder.amount,
            currency: "INR",
            name: "Rice Flour Shop",
            description: `${quantity} kg Rice Flour`,
            order_id: razorpayOrder.orderId,
            handler: async function (response) {
              try {
                // Submit order with payment details
                const orderData = {
                  deviceId,
                  quantity,
                  instructions: instructions || null,
                  date: selectedDate,
                  slot: selectedSlot,
                  totalPrice,
                  paymentMethod: "UPI",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                };

                await postOrder(orderData);
                
                // Mark first discount as used
                if (useFirstDiscount && firstDiscountAvailable) {
                  localStorage.setItem("firstDiscountUsed", "1");
                }

                navigate("/confirmation");
              } catch (err) {
                console.error("Order submission failed:", err);
                alert("ஆர்டர் சமர்ப்பிப்பில் தவறு: " + (err.message || "Unknown error"));
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: "",
              email: "",
              contact: ""
            },
            theme: {
              color: "#667eea"
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
                alert("பணம் செலுத்துதல் ரத்து செய்யப்பட்டது");
              }
            }
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };

        script.onerror = () => {
          setLoading(false);
          alert("Razorpay ஏற்ற முடியவில்லை. இணைய இணைப்பை சரிபார்க்கவும்.");
        };

      } else {
        // COD Order
        const orderData = {
          deviceId,
          quantity,
          instructions: instructions || null,
          date: selectedDate,
          slot: selectedSlot,
          totalPrice,
          paymentMethod: "COD",
          razorpayOrderId: null,
          razorpayPaymentId: null,
          razorpaySignature: null
        };

        await postOrder(orderData);
        
        // Mark first discount as used
        if (useFirstDiscount && firstDiscountAvailable) {
          localStorage.setItem("firstDiscountUsed", "1");
        }

        setShowConfirmModal(false);
        navigate("/confirmation");
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("ஆர்டர் தோல்வி: " + (err.message || "Unknown error"));
>>>>>>> 13e916a (Update API base URL and tested locally)
    } finally {
      setLoading(false);
    }
  }

  function goToItem() {
    if (navigate) navigate("/item");
    else window.location.hash = "#/item";
  }

  if (checking) {
    return (
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-background" />
          <div className="hero-content">
            <div className="hero-badge">🌾 Premium Quality</div>
            <h1 className="hero-title">
              எளிய முறையில் உங்களுக்குத் தேவையான பொருட்களை இங்கே ஆர்டர் செய்யலாம்
            </h1>
            <p className="hero-subtitle">Fresh • Fast • Reliable</p>
          </div>
        </div>
        <div className="content-container">
          <div className="main-card">
            <p style={{ textAlign: "center", padding: "20px" }}>சரிபார்க்கிறது...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-background" />
        <div className="hero-content">
          <div className="hero-badge">🌾 Premium Quality</div>
          <h1 className="hero-title">
            எளிய முறையில் உங்களுக்குத் தேவையான பொருட்களை இங்கே ஆர்டர் செய்யலாம்
          </h1>
          <p className="hero-subtitle">Fresh • Fast • Reliable</p>
        </div>
      </div>

      <div className="content-container">
        {!registered && (
          <div className="promo-card">
            <div className="promo-icon">🎁</div>
            <div className="promo-content">
              <h3>Welcome Bonus!</h3>
              <p>பிற தகவல்களை வழங்கினால் ₹5 தள்ளுபடி கொடுப்போம்.</p>
              <button className="btn-promo" onClick={() => setShowForm(true)}>
                <span>பிற தகவல்கள்</span>
                <span className="btn-arrow">→</span>
              </button>
  return (
    <div className="item-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>ஆர்டர் செய்ய</h1>
      </div>

      <div className="item-container">
        {/* Delivery Section */}
        <div className="delivery-section">
          <h3>🚚 டெலிவரி தேதி & நேரம்</h3>
          
          <div className="time-options">
            <button
              className={`time-btn ${selectedDate === 'today' ? 'active' : ''}`}
              onClick={() => handleDateSelect('today')}
            >
              <span className="time-icon">📅</span>
              <span>இன்று</span>
            </button>
            <button
              className={`time-btn ${selectedDate === 'tomorrow' ? 'active' : ''}`}
              onClick={() => handleDateSelect('tomorrow')}
            >
              <span className="time-icon">📅</span>
              <span>நாளை</span>
            </button>
          </div>

          {selectedDate && (
            <button 
              className="time-btn" 
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => setShowSlotModal(true)}
            >
              <span className="time-icon">⏰</span>
              <span>{selectedSlot ? (selectedSlot === 'morning' ? 'காலை' : 'மாலை') : 'நேரத்தை தேர்ந்தெடு'}</span>
            </button>
          )}

          {selectedDate && selectedSlot && (
            <div className="selected-time">
              தேர்ந்தெடுக்கப்பட்டது: {selectedDate === 'today' ? 'இன்று' : 'நாளை'} - {selectedSlot === 'morning' ? 'காலை' : 'மாலை'}
            </div>
          )}
        </div>

        {/* Product Showcase */}
        <div className="product-showcase">
          <div className="product-image-container">
            <div className="product-badge">Fresh!</div>
            <div className="image-glow" />
            <div className="product-image">🌾</div>
          </div>
          <h2 className="product-name">அரிசி மாவு</h2>
          <p className="product-description">தரமான, புதிய அரிசி மாவு</p>
        </div>

        {/* Pricing Card */}
        <div className="pricing-card">
          <div className="price-header">
            <span>அலகு விலை</span>
            <span className="price-tag">₹{UNIT_PRICE}</span>
          </div>

          {/* Quantity Section */}
          <div className="quantity-section">
            <label>அளவு </label>
            <div className="quantity-control">
              <button className="qty-btn" onClick={decrementQty} type="button">−</button>
              <span className="qty-display">{quantity}</span>
              <button className="qty-btn" onClick={incrementQty} type="button">+</button>
            </div>
          </div>
        )}

        {registered && showSuccessBanner && (
          <div className="success-banner animate-in">
            <div className="success-icon">✓</div>
            <div>
              <strong>வெற்றி!</strong>
              <p>உங்கள் கர்வியில் பதிவு செய்யப்பட்டுள்ளது. ₹5 தள்ளுபடி வழங்கப்படுகிறது.</p>
            </div>
          </div>
        )}

        {registered && !showSuccessBanner && (
          <>
            {/* Quick Features */}
            <div className="quick-features">
              <div className="quick-feature">
                <span className="quick-icon">⚡</span>
                <span className="quick-text">Same Day Delivery</span>
              </div>
              <div className="quick-feature">
                <span className="quick-icon">✨</span>
                <span className="quick-text">Fresh Daily</span>
              </div>
              <div className="quick-feature">
                <span className="quick-icon">💰</span>
                <span className="quick-text">Best Price</span>
              </div>
            </div>

            {/* Customer Review */}
            <div className="customer-highlight">
              <div className="highlight-header">
                <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                <span className="rating-text">4.9 Rating</span>
              </div>
              <p className="highlight-quote">
                "மிகவும் தரமான அரிசி மாவு. விரைவான டெலிவரி!"
              </p>
              <div className="highlight-stats">
                <div className="stat-mini">
                  <strong>50+</strong>
                  <span>Customers</span>
                </div>
                <div className="stat-mini">
                  <strong>200+</strong>
                  <span>Orders</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="main-card">
          <div className="card-header">
            <div className="card-icon">📦</div>
            <div>
              <h2>பிரதான பொருள்</h2>
              <p className="card-subtitle">குறைந்த விலையில் நல்ல விதமான அரிசி மாவு.</p>
            </div>
          </div>

          <button className="btn-primary pulse-animation" onClick={goToItem}>
            <span>பொருள் பார்க்க</span>
            <span className="btn-shine" aria-hidden />
          {/* Payment Method Selection */}
          <div className="payment-method-section">
            <label>பணம் செலுத்தும் முறை</label>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Cash on Delivery (COD)</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>📱 Online Payment (UPI)</span>
              </label>
            </div>
          </div>

          {/* Discount Selection */}
          {firstDiscountAvailable && (
            <div className="discount-selection-section">
              <h4>🎁 சலுகைகள்</h4>
              <p className="discount-note">முதல் ஆர்டருக்கு தள்ளுபடி கிடைக்கும்</p>
              <label className="discount-option">
                <input
                  type="checkbox"
                  checked={useFirstDiscount}
                  onChange={(e) => setUseFirstDiscount(e.target.checked)}
                />
                <div className="discount-details">
                  <strong>முதல் ஆர்டர் தள்ளுபடி</strong>
                  <small>₹{FIRST_ORDER_DISCOUNT} சேமிக்கவும்</small>
                </div>
              </label>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span>துணை மொத்தம்:</span>
              <span>₹{quantity * UNIT_PRICE}</span>
            </div>
            {firstDiscountAvailable && useFirstDiscount && (
              <div className="price-row discount">
                <span>முதல் ஆர்டர் தள்ளுபடி:</span>
                <span>-₹{FIRST_ORDER_DISCOUNT}</span>
              </div>
            )}
            {firstDiscountAvailable && !useFirstDiscount && (
              <div className="price-row discount-unused">
                <span>தள்ளுபடி (பயன்படுத்தப்படவில்லை):</span>
                <span>-₹{FIRST_ORDER_DISCOUNT} <small>(முடக்கப்பட்டது)</small></span>
              </div>
            )}
            <div className="price-row total">
              <span>மொத்தம்:</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <label>குறிப்புகள் (விரும்பினால்)</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="சிறப்பு குறிப்புகள்..."
              rows="3"
            />
          </div>

          {/* Order Button */}
          <button 
            className="order-btn" 
            onClick={handleOrderClick}
            disabled={!selectedDate || !selectedSlot || loading}
          >
            <span>🛒</span>
            <span>ஆர்டர் செய்</span>
          </button>
        </div>

        {/* Trust Indicators */}
        {registered && !showSuccessBanner && (
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Secure Payment</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span className="trust-text">Quality Assured</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🚚</span>
              <span className="trust-text">Fast Delivery</span>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content big-form fancy-form" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            <div className="modal-header">
              <div className="modal-icon">📝</div>
              <h2>பதிவு செய்யவும்</h2>
              <p>உங்கள் தகவல்களை வழங்கினால் தள்ளுபடி வழங்கப்படும்</p>
      {/* Slot Selection Modal */}
      {showSlotModal && (
        <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
          <div className="modal-content slot-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSlotModal(false)}>×</button>
            <h2>டெலிவரி நேரத்தை தேர்ந்தெடுக்கவும்</h2>
            <p className="slot-desc">உங்களுக்கு வசதியான நேரத்தை தேர்ந்தெடுக்கவும்</p>
            
            <div className="slot-options">
              <button className="slot-btn" onClick={() => handleSlotSelect('morning')}>
                <strong>காலை</strong>
                <span className="slot-time">6 AM - 12 PM</span>
              </button>
              <button className="slot-btn" onClick={() => handleSlotSelect('evening')}>
                <strong>மாலை</strong>
                <span className="slot-time">4 PM - 8 PM</span>
              </button>
            </div>

            <form onSubmit={submitRegistration} className="modal-form big-inputs" noValidate>
              <div className="form-group">
                <label>பெயர் *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="உங்கள் பெயரை உள்ளிடவும்" autoFocus />
              </div>

              <div className="form-group">
                <label>ஊர்</label>
                <input type="text" value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  placeholder="உங்கள் ஊரை உள்ளிடவும்" />
              </div>

              <div className="form-group">
                <label>தொலைபேசி எண் *</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX" />
              </div>

              <div className="form-group">
                <label>பிற குறிப்புகள்</label>
                <textarea value={form.otherInfo}
                  onChange={(e) => setForm({ ...form, otherInfo: e.target.value })}
                  placeholder="கூடுதல் தகவல்கள்..." rows="3" />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>முடக்கு</button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "இடையே..." : "பதிவு செய்"}
                </button>
              </div>
            </form>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowConfirmModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => !loading && setShowConfirmModal(false)}
              disabled={loading}
            >
              ×
            </button>
            
            <div className="confirm-icon">⚠️</div>
            <h2>ஆர்டரை உறுதிப்படுத்தவும்</h2>
            
            <div className="confirm-details">
              <p>
                <strong>அளவு:</strong>
                <span>{quantity} kg</span>
              </p>
              <p>
                <strong>மொத்த விலை:</strong>
                <span>₹{calculateTotal()}</span>
              </p>
              <p>
                <strong>தேதி:</strong>
                <span>{selectedDate === 'today' ? 'இன்று' : 'நாளை'}</span>
              </p>
              <p>
                <strong>நேரம்:</strong>
                <span>{selectedSlot === 'morning' ? 'காலை' : 'மாலை'}</span>
              </p>
              <p>
                <strong>பணம் செலுத்தும் முறை:</strong>
                <span>{paymentMethod === 'COD' ? '💵 COD' : '📱 Online'}</span>
              </p>
              {instructions && (
                <p>
                  <strong>குறிப்புகள்:</strong>
                  <span>{instructions}</span>
                </p>
              )}
            </div>
            
            <div className="confirm-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                ரத்து செய்
              </button>
              <button 
                className="btn-confirm" 
                onClick={confirmOrder}
                disabled={loading}
              >
                {loading ? 'செயல்படுத்துகிறது...' : 'உறுதிப்படுத்து'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}