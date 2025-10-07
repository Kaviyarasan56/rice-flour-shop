import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, getUserByDevice } from "../api";

export default function Home({ deviceId, registered, setRegistered }) {
  const [showForm, setShowForm] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ name: "", village: "", phone: "", otherInfo: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkReg() {
      if (!deviceId) {
        setChecking(false);
        return;
      }

      try {
        // Check if user is admin
        const adminCheck = await fetch(`https://rice-flour-backend-production.up.railway.app/api/admin-auth/verify/${deviceId}`);
        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          if (adminData.isAdmin) {
            setIsAdmin(true);
            localStorage.setItem("isAdmin", "1");
          }
        }

        const user = await getUserByDevice(deviceId);
        
        if (user && user.id) {
          localStorage.setItem("registered", "1");
          setRegistered(true);
          
          const justRegistered = sessionStorage.getItem("justRegistered");
          if (justRegistered === "1") {
            setShowSuccessBanner(true);
            sessionStorage.removeItem("justRegistered");
            
            setTimeout(() => {
              setShowSuccessBanner(false);
            }, 5000);
          }
        } else {
          localStorage.removeItem("registered");
          localStorage.removeItem("firstDiscountUsed");
          setRegistered(false);
        }
      } catch (err) {
        console.error("Failed to check registration:", err);
        localStorage.removeItem("registered");
        setRegistered(false);
      } finally {
        setChecking(false);
      }
    }
    
    checkReg();
  }, [deviceId, setRegistered]);

  async function submitRegistration(e) {
    e.preventDefault();
    setError("");
    
    if (!form.name || !form.name.trim()) {
      setError("பெயர் கொடுக்கவும்.");
      return;
    }
    
    if (!form.phone || !form.phone.trim()) {
      setError("தொலைபேசி எண் கொடுக்கவும்.");
      return;
    }
    
    const phoneRegex = /^[0-9+\s-]{10,15}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setError("சரியான தொலைபேசி எண்ணை உள்ளிடவும்.");
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        deviceId: deviceId,
        name: form.name.trim(),
        village: form.village.trim() || null,
        phone: form.phone.trim(),
        otherInfo: form.otherInfo.trim() || null
      };
      
      const user = await registerUser(userData);
      
      if (user && user.id) {
        localStorage.setItem("registered", "1");
        sessionStorage.setItem("justRegistered", "1");
        setRegistered(true);
        setShowForm(false);
        setShowSuccessBanner(true);
        
        setForm({ name: "", village: "", phone: "", otherInfo: "" });
        
        setTimeout(() => {
          setShowSuccessBanner(false);
        }, 5000);
      } else {
        throw new Error("Registration failed - invalid response");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.message && err.message.includes("ஏற்கனவே பதிவு")) {
        setError("இந்த தொலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.");
      } else if (err.message && err.message.includes("409")) {
        setError("இந்த தொலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.");
      } else {
        setError("பதிவில் தவறு. மீண்டும் முயற்சிக்கவும்.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitAdminLogin(e) {
    e.preventDefault();
    setAdminError("");
    
    if (!adminForm.username || !adminForm.password) {
      setAdminError("Username and password required");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8080/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminForm.username,
          password: adminForm.password,
          deviceId: deviceId
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const data = await response.json();
      
      if (data.success && data.isAdmin) {
        localStorage.setItem("isAdmin", "1");
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminForm({ username: "", password: "" });
        alert("Admin login successful!");
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setAdminError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToItem() {
    if (!registered) {
      alert("முதலில் பதிவு செய்யவும்!");
      return;
    }
    navigate("/item");
  }

  function goToMyOrders() {
    if (!registered) {
      alert("முதலில் பதிவு செய்யவும்!");
      return;
    }
    navigate("/my-orders");
  }

  function goToAdmin() {
    if (!isAdmin) {
      setShowAdminLogin(true);
      return;
    }
    navigate("/admin");
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
          
          {/* Admin Login Icon */}
          <button 
            className="admin-login-icon"
            onClick={() => setShowAdminLogin(true)}
            title="Admin Login"
          >
            🔐
          </button>
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
              <p>உங்கள் கருவியில் பதிவு செய்யப்பட்டுள்ளது. ₹5 தள்ளுபடி வழங்கப்படுகிறது.</p>
            </div>
          </div>
        )}

        {registered && !showSuccessBanner && (
          <>
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
            <span className="btn-shine" aria-hidden="true" />
          </button>
        </div>

        {registered && (
          <div className="navigation-buttons">
            <button className="nav-btn" onClick={goToMyOrders}>
              <span className="nav-icon">📦</span>
              <span>My Orders</span>
            </button>
            
            <button className="nav-btn admin-btn" onClick={goToAdmin}>
              <span className="nav-icon">⚙️</span>
              <span>Admin Panel</span>
            </button>
          </div>
        )}

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

      {/* Registration Modal */}
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
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="உங்கள் பெயரை உள்ளிடவும்" 
                  autoFocus 
                  required
                />
              </div>

              <div className="form-group">
                <label>ஊர்</label>
                <input 
                  type="text" 
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  placeholder="உங்கள் ஊரை உள்ளிடவும்" 
                />
              </div>

              <div className="form-group">
                <label>தொலைபேசி எண் *</label>
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX" 
                  required
                />
              </div>

              <div className="form-group">
                <label>பிற குறிப்புகள்</label>
                <textarea 
                  value={form.otherInfo}
                  onChange={(e) => setForm({ ...form, otherInfo: e.target.value })}
                  placeholder="கூடுதல் தகவல்கள்..." 
                  rows="3" 
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  மூடக்க
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={loading}
                >
                  {loading ? "இடையே..." : "பதிவு செய்"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="modal-content admin-login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAdminLogin(false)}>×</button>
            <div className="modal-header">
              <div className="modal-icon">🔐</div>
              <h2>Admin Login</h2>
              <p>Enter admin credentials to access dashboard</p>
            </div>

            <form onSubmit={submitAdminLogin} className="modal-form" noValidate>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="Enter username" 
                  autoFocus 
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Enter password" 
                  required
                />
              </div>

              {adminError && <div className="error-message">{adminError}</div>}

             

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAdminLogin(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}