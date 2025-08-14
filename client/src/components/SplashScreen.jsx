// src/components/SplashScreen.jsx
import React, { useEffect } from "react";
import "./SplashScreen.css";
import SplitText from "./SplitText";

const SplashScreen = ({ onLoaded }) => {
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      onLoaded();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className="splash-container">
      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              "--delay": `${Math.random() * 2}s`,
              "--size": `${Math.random() * 6 + 2}px`,
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 100}%`,
              "--duration": `${Math.random() * 10 + 10}s`,
              "--color":
                i % 3 === 0
                  ? "var(--accent-primary)"
                  : i % 3 === 1
                  ? "var(--secondary-accent)"
                  : "var(--color-accent-highlight)",
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo with animation */}
         
        <div className="logo-container">

         
           
          <div className="logo-shimmer"></div>
          
          <h1 className="logo-text">
            {/* <span className="logo-gradient">Y</span>
            <span className="logo-gradient">U</span>
            <span className="logo-gradient">K</span>
            <span className="logo-gradient">T</span>
            <span className="logo-gradient">I</span>
            <span className="logo-gradient">V</span>
            <span className="logo-gradient">E</span>
            <span className="logo-gradient">R</span>
            <span className="logo-gradient">S</span>
            <span className="logo-gradient">E</span> */}
           
            <SplitText
              text="Yuktiverse!"
              className="text-2xl font-semibold text-center"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </h1>
          <div className="logo-subtitle">AI-Powered Knowledge Universe</div>
        </div>

        {/* Feature badges */}
        <div className="feature-badges">
          <div className="badge">Resume Analyzer</div>
          <div className="badge">PDF Summarizer</div>
          <div className="badge">Academic Notes</div>
          <div className="badge">AI Assistant</div>
        </div>

        {/* Loading animation */}
        <div className="loading-container">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <div className="loading-text">Initializing AI systems...</div>
        </div>
      </div>

      {/* Glow effects */}
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>
      <div className="glow glow-3"></div>
    </div>
  );
};

export default SplashScreen;
