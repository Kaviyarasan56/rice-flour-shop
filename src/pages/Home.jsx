import React, { useEffect, useState } from "react";
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
          </div>
        </div>
      )}
    </div>
  );
}