import React from "react";
import "../styles/confirmation.css";
import { useParams, useNavigate } from "react-router-dom";

function Confetti() {
  return (
    <div className="confetti">
      {Array.from({ length: 50 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

export default function Confirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="confirm-container">
      <Confetti />

      {/* Header */}
      <div className="confirm-block">
        <h1>🎉 நன்றி! உங்கள் ஆர்டர் வெற்றியாக பதிவாகியது!</h1>
        <p className="order-info">ஆர்டர் எண்: <strong>{id}</strong></p>
      </div>

      {/* Fun Message */}
      <div className="confirm-block">
        <p>🥣 அரிசி மாவு சீராக பாக்கம் செய்யப்படுகிறது!</p>
        <p>⏰ உங்கள் தேர்ந்தெடுத்த நேரத்தில் டெலிவரி செய்யப்படும்!</p>
      </div>

      {/* Action Buttons */}
      <div className="confirm-block buttons">
        <button className="primary-btn" onClick={() => navigate("/item")}>மேலும் ஆர்டர் செய்ய</button>
        <button className="secondary-btn" onClick={() => navigate("/")}>முதன்மை பக்கத்துக்கு</button>
      </div>
    </div>
  );
}
