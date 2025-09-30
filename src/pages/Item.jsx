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
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirm = async () => {
    if (!date || !slot) {
      setConfirmationMessage("தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.");
      return;
    }
    const payload = { quantity, instructions, date, slot };
    try {
      await fetch("https://rice-flour-backend-production.up.railway.app/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setConfirmationMessage("✅ உங்கள் ஆர்டர் வெற்றிகரமாகப் பதிவாகியுள்ளது.");
      try { window.navigator.vibrate && window.navigator.vibrate(35); } catch(_) {}

      // Redirect to static confirmation page
      setTimeout(() => {
        window.location.href = "/confirmation";
      }, 600);

    } catch (err) {
      console.error(err);
      setConfirmationMessage("⚠️ ஏதோ தவறு ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
    }
  };

  const isMorningDisabled = date === "today" ? currentHour >= 10 : false;
  const isEveningDisabled = date === "today" ? currentHour >= 17 : false;

  return (
    <div className="container item-page">
      <h2>🍚 அரிசி மாவு ஆர்டர்</h2>

      <div className="date-buttons btn-group">
        <button
          className={date === "today" ? "active" : ""}
          disabled={currentHour >= 17}
          onClick={() => { setDate("today"); setSlot(null); setConfirmationMessage(""); }}
        >இன்று</button>
        <button
          className={date === "tomorrow" ? "active" : ""}
          onClick={() => { setDate("tomorrow"); setSlot(null); setConfirmationMessage(""); }}
        >நாளை</button>
      </div>

      {date && (
        <div className="slot-buttons btn-group">
          <button
            className={slot === "morning" ? "active" : ""}
            disabled={isMorningDisabled}
            onClick={() => setSlot("morning")}
          >காலை</button>
          <button
            className={slot === "evening" ? "active" : ""}
            disabled={isEveningDisabled}
            onClick={() => setSlot("evening")}
          >மாலை</button>
        </div>
      )}

      {(date || slot) && (
        <div className="selection-chips">
          {date && <span className="chip">{date === "today" ? "இன்று" : "நாளை"}</span>}
          {slot && <span className="chip">{slot === "morning" ? "காலை" : "மாலை"}</span>}
        </div>
      )}

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

      <div className="quantity-selector">
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <span className="qty-value">{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
      </div>

      <div className="instructions">
        <button onClick={() => setShowInstructions(v => !v)}>
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

      <button className="confirm-btn" onClick={handleConfirm}>உறுதிசெய்</button>

      {confirmationMessage && (
        <p className="confirmation-msg" role="status">{confirmationMessage}</p>
      )}
    </div>
  );
}
