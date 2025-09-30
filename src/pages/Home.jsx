import React from "react";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleVisitItem = () => {
    navigate("/item");
  };

  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero-block">
        <h1 className="hero-title">🌾 வணக்கம்!</h1>
        <p className="hero-funny">மாவு வாங்கலயோ? 😄</p>
      </section>

      {/* Order Button Block */}
      <section className="order-block">
        <button className="cta-btn" onClick={handleVisitItem}>
          ஆர்டர் செய்ய இப்போதே!
        </button>
      </section>

     

      {/* Info / Badge Block */}
      <section className="info-block">
        <div className="badge">தினசரி تازா</div>
        <p className="hero-sub">
          அரிசி மாவு – நேருக்கு நேராக உங்கள் வீட்டுக்கு.
        </p>
      </section>

      {/* Decorative Floating Shapes */}
      <div className="floating-shapes">
        <span className="circle"></span>
        <span className="triangle"></span>
        <span className="circle small"></span>
      </div>
    </div>
  );
}

export default Home;
