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
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirm = () => {
    if (!date || !slot) {
      alert("தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.");
      return;
    }

    // Show full-screen success overlay
    setShowSuccess(true);

    // Redirect to home after 5 seconds
    setTimeout(() => {
      window.location.href = "/";
    }, 5000);
  };

  if (showSuccess) {
    return (
      <div className="full-screen-success">
        <h1>✅ உங்கள் ஆர்டர் வெற்றிகரமாகப் பதிவாகியது!</h1>
        <p>5 விநாடிகளுக்கு பின்னர் முதன்மை பக்கத்துக்கு திரும்புகிறீர்கள்...</p>
      </div>
    );
  }

  const isMorningDisabled = date === "today" ? currentHour >= 10 : false;
  const isEveningDisabled = date === "today" ? currentHour >= 17 : false;

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
          <button className={slot === "morning" ? "active" : ""} disabled={isMorningDisabled} onClick={() => setSlot("morning")}>காலை</button>
          <button className={slot === "evening" ? "active" : ""} disabled={isEveningDisabled} onClick={() => setSlot("evening")}>மாலை</button>
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

      {/* Quantity */}
      <div className="quantity-selector">
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <span className="qty-value">{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="குறிப்பு (விருப்பம்)" rows={3} />
      </div>

      {/* Confirm */}
      <button className="confirm-btn" onClick={handleConfirm}>உறுதிசெய்</button>
    </div>
  );
}
