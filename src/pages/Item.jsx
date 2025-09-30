import React, { useState, useEffect, Suspense } from "react";
import "../styles/item.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

function RotatingPocket() {
  const texture = useTexture("/maavupocket.png");
  const ref = React.useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(performance.now() / 1200) * 0.15;
      ref.current.rotation.x = 0.05;
    }
  });

  return (
    <mesh ref={ref} scale={[1.6, 1.6, 1]}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

export default function ItemTamil() {
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [showInstructions, setShowInstructions] = useState(false);
  const [successOrder, setSuccessOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirm = async () => {
    if (!date || !slot) {
      setSuccessMessage("தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.");
      return;
    }

    const payload = { quantity, instructions, date, slot };

    try {
      const res = await fetch(
        "https://rice-flour-backend-production.up.railway.app/api/orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      // Show full-screen success
      setSuccessOrder(true);
      setSuccessMessage(
        `✅ உங்கள் ஆர்டர் வெற்றிகரமாகப் பதிவாகியுள்ளது!\nஆர்டர் எண்: ${data.id}\nஅளவு: ${quantity}\nதேதி: ${
          date === "today" ? "இன்று" : "நாளை"
        }\nநேரம்: ${slot === "morning" ? "காலை" : "மாலை"}`
      );

      // Vibrate
      try { window.navigator.vibrate && window.navigator.vibrate(35); } catch (_) {}

      // Redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 5000);

    } catch (err) {
      console.error(err);
      setSuccessMessage("⚠️ ஏதோ தவறு ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
    }
  };

  const isMorningDisabled = date === "today" ? currentHour >= 10 : false;
  const isEveningDisabled = date === "today" ? currentHour >= 17 : false;

  if (successOrder) {
    // Full-screen overlay
    return (
      <div className="success-overlay">
        <h1>🎉 ஆர்டர் வெற்றி! 🎉</h1>
        <p>{successMessage.split("\n").map((line, idx) => (<span key={idx}>{line}<br/></span>))}</p>
        <p>5 வினாடிகளில் முதன்மை பக்கத்திற்கு திரும்பும்...</p>
      </div>
    );
  }

  return (
    <div className="container item-page">
      <h2>🍚 அரிசி மாவு ஆர்டர்</h2>

      {/* Date Buttons */}
      <div className="date-buttons btn-group">
        <button
          className={date === "today" ? "active" : ""}
          disabled={currentHour >= 17}
          onClick={() => { setDate("today"); setSlot(null); }}
        >
          இன்று
        </button>
        <button
          className={date === "tomorrow" ? "active" : ""}
          onClick={() => { setDate("tomorrow"); setSlot(null); }}
        >
          நாளை
        </button>
      </div>

      {/* Slot Buttons */}
      {date && (
        <div className="slot-buttons btn-group">
          <button
            className={slot === "morning" ? "active" : ""}
            disabled={isMorningDisabled}
            onClick={() => setSlot("morning")}
          >
            காலை
          </button>
          <button
            className={slot === "evening" ? "active" : ""}
            disabled={isEveningDisabled}
            onClick={() => setSlot("evening")}
          >
            மாலை
          </button>
        </div>
      )}

      {/* 3D Model */}
      <div className="pocket-glow model-block">
        <Canvas style={{ height: 240 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 5, 2]} />
          <Suspense fallback={null}>
            <RotatingPocket />
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate={false} />
        </Canvas>
      </div>

      {/* Quantity Selector */}
      <div className="quantity-selector">
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <span className="qty-value">{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <button type="button" onClick={() => setShowInstructions(v => !v)}>
          {showInstructions ? "குறிப்பை மறை" : "குறிப்பு சேர்க்க"}
        </button>
        {showInstructions && (
          <textarea
            placeholder="குறிப்பு (விருப்பம்)"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {/* Confirm */}
      <button className="confirm-btn" onClick={handleConfirm}>உறுதிசெய்</button>
    </div>
  );
}
