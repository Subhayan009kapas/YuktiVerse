// src/pages/NotFound.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Initial text animation
    setTimeout(() => setTextVisible(true), 500);

    // Glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 4000);

    return () => clearInterval(glitchInterval);
  }, []);

  const createParticles = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          "--delay": `${Math.random() * 20}s`,
          "--size": `${Math.random() * 4 + 2}px`,
          "--x": `${Math.random() * 100}%`,
          "--y": `${Math.random() * 100}%`,
          "--duration": `${Math.random() * 15 + 15}s`,
          "--color": 
            i % 3 === 0 ? "#4f46e5" : 
            i % 3 === 1 ? "#7c3aed" : "#06b6d4"
        }}
      />
    ));
  };

  const splitText = (text) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className="split-char"
        style={{ animationDelay: `${i * 0.1}s` }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div className="not-found-container">
      <style>
        {`
          .not-found-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: radial-gradient(ellipse at center, #1a1625 0%, #0c0a1f 70%, #000 100%);
            color: #e0e7ff;
            text-align: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          /* Floating Particles */
          .particle {
            position: absolute;
            width: var(--size);
            height: var(--size);
            background: var(--color);
            border-radius: 50%;
            opacity: 0.6;
            animation: float var(--duration) infinite linear;
            animation-delay: var(--delay);
            box-shadow: 0 0 10px var(--color);
            will-change: transform;
          }

          @keyframes float {
            0% {
              transform: translate3d(var(--x), 110vh, 0) rotate(0deg);
              opacity: 0;
            }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% {
              transform: translate3d(calc(var(--x) + 50px), -10vh, 0) rotate(720deg);
              opacity: 0;
            }
          }

          /* Glow Effects */
          .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            animation: pulse 4s ease-in-out infinite;
          }

          .glow-1 {
            width: 300px;
            height: 300px;
            background: #4f46e5;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
          }

          .glow-2 {
            width: 250px;
            height: 250px;
            background: #7c3aed;
            top: 60%;
            right: 15%;
            animation-delay: 2s;
          }

          .glow-3 {
            width: 200px;
            height: 200px;
            background: #06b6d4;
            bottom: 20%;
            left: 50%;
            animation-delay: 1s;
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.2;
            }
            50% { 
              transform: scale(1.2); 
              opacity: 0.4;
            }
          }

          /* 404 Error Code */
          .error-code {
            font-size: clamp(4rem, 15vw, 12rem);
            font-weight: 900;
            background: linear-gradient(45deg, #4f46e5, #7c3aed, #06b6d4, #4f46e5);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientShift 3s ease-in-out infinite;
            margin-bottom: 1rem;
            position: relative;
            letter-spacing: -0.05em;
            text-shadow: 0 0 30px rgba(79, 70, 229, 0.5);
            transform: translateY(0);
            transition: all 0.3s ease;
          }

          .error-code.glitch {
            animation: gradientShift 3s ease-in-out infinite, glitch 0.3s ease-in-out;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes glitch {
            0% { transform: translate(0); }
            10% { transform: translate(-2px, 2px); }
            20% { transform: translate(-2px, -2px); }
            30% { transform: translate(2px, 2px); }
            40% { transform: translate(2px, -2px); }
            50% { transform: translate(-2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            70% { transform: translate(2px, 2px); }
            80% { transform: translate(-2px, -2px); }
            90% { transform: translate(2px, 2px); }
            100% { transform: translate(0); }
          }

          /* Main Content */
          .main-content {
            z-index: 10;
            position: relative;
            max-width: 800px;
            width: 100%;
          }

          .error-message {
            font-size: clamp(1.1rem, 3vw, 1.5rem);
            margin-bottom: 1rem;
            margin-top: -1rem;
            opacity: ${textVisible ? 0.9 : 0};
            transform: translateY(${textVisible ? 0 : 30}px);
            transition: all 0.8s ease 0.5s;
            font-weight: 300;
            letter-spacing: 0.05em;
          }

          /* Yukti Verse Card */
          .yukti-verse {
            max-width: 700px;
            margin: 0rem auto;
            padding: 2.5rem;
            background: rgba(26, 22, 37, 0.8);
            border: 1px solid rgba(124, 58, 237, 0.2);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            opacity: ${textVisible ? 1 : 0};
            transform: translateY(${textVisible ? 0 : 50}px);
            transition: all 1s ease 1s;
            position: relative;
            overflow: hidden;
          }

          .yukti-verse::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg, 
              transparent, 
              rgba(124, 58, 237, 0.1), 
              transparent
            );
            animation: shimmer 4s infinite;
          }

          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          .verse-title {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .verse-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #c7d2fe;
            font-style: italic;
            position: relative;
            z-index: 1;
          }

          .split-char {
            display: inline-block;
            opacity: ${textVisible ? 1 : 0};
            transform: translateY(${textVisible ? 0 : 20}px);
            animation: ${textVisible ? 'charReveal 0.6s ease forwards' : 'none'};
          }

          @keyframes charReveal {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Home Button */
          .home-button {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            margin-top: 2rem;
            box-shadow: 
              0 4px 16px rgba(79, 70, 229, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1);
            opacity: ${textVisible ? 1 : 0};
            transform: translateY(${textVisible ? 0 : 30}px);
            transition: all 0.8s ease 1.5s;
            position: relative;
            overflow: hidden;
          }

          .home-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.2),
              transparent
            );
            transition: left 0.5s ease;
          }

          .home-button:hover::before {
            left: 100%;
          }

          .home-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
              0 8px 25px rgba(79, 70, 229, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.2);
          }

          .home-button:active {
            transform: translateY(0) scale(0.98);
          }

          /* Status Text */
          .status-text {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.6;
            color: #a5b4fc;
            font-family: 'Courier New', monospace;
            opacity: ${textVisible ? 0.6 : 0};
            transition: opacity 0.8s ease 2s;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .not-found-container {
              padding: 1rem;
            }
            
            .yukti-verse {
              margin: 2rem auto;
              padding: 1.5rem;
            }
            
            .verse-content {
              font-size: 1rem;
            }
            
            .home-button {
              padding: 0.75rem 1.5rem;
              font-size: 1rem;
            }
          }
        `}
      </style>

      {/* Floating Particles */}
      <div className="particles">
        {createParticles()}
      </div>

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>
      <div className="glow glow-3"></div>

      {/* Main Content */}
      <div className="main-content">
        <div className={`error-code ${glitchActive ? 'glitch' : ''}`}>
          404
        </div>

        <div className="error-message">
          Oops! This page seems to have wandered into the digital void.
        </div>

        <div className="yukti-verse">
          <div className="verse-title">
            ✨ Yukti Verse
          </div>
          <div className="verse-content">
            {splitText("In the vast expanse of knowledge and wisdom, some paths lead to discovery, while others guide us back to where we belong. Every error is but a stepping stone to greater understanding.")}
          </div>
        </div>

        <Link to={import.meta.env.VITE_FRONTENED_URL} className="home-button">
          <span>🏠</span>
          <span>Return to Yuktiverse</span>
        </Link>

        <div className="status-text">
          Error Code: YUKTI_404 | AI Systems: Operational | Knowledge Base: Intact
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;