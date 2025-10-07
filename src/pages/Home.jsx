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
  const navigate = useNavigate?.() ?? null;

  useEffect(() => {
    async function checkReg() {
      try {
        // Check localStorage first - avoid unnecessary API calls
        if (localStorage.getItem("registered") === "1") {
          setRegistered(true);
          return;
        }
        
        // Only check backend if localStorage says not registered
        if (!deviceId) return;
        
        const u = await getUserByDevice(deviceId);
        if (u) {
          localStorage.setItem("registered", "1");
          setRegistered(true);
        }
      } catch (err) {
        console.warn("getUserByDevice failed:", err);
        // Don't show error - registration might still be valid locally
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
      await registerUser({ ...form, deviceId });
      localStorage.setItem("registered", "1");
      setRegistered(true);
      setShowForm(false);
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
              <p>உங்கள் கர்வியில் பதிவு செய்யப்பட்டுள்ளது. ₹5 தள்ளுபடி வழங்கப்படுகிறது.</p>
            </div>
          </div>
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