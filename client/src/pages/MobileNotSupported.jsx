import React, { useState, useEffect, useCallback, useRef } from "react";

const MobileNotSupported = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [deviceOrientation, setDeviceOrientation] = useState('portrait');
  const containerRef = useRef(null);

  // Enhanced mouse tracking for parallax effects
  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  }, []);

  // Device orientation detection
  const handleOrientationChange = useCallback(() => {
    setDeviceOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
  }, []);

  useEffect(() => {
    // Staggered animations
    const timers = [
      setTimeout(() => setTextVisible(true), 800),
      setTimeout(() => setShowComingSoon(true), 2500)
    ];

    // Enhanced glitch effect with smart timing
    const createGlitchEffect = () => {
      const randomDelay = Math.random() * 8000 + 4000;
      const glitchTimer = setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 500);
        createGlitchEffect();
      }, randomDelay);
      return glitchTimer;
    };
    
    const glitchTimer = createGlitchEffect();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(glitchTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [handleMouseMove, handleOrientationChange]);

  const createAdvancedParticles = () =>
    Array.from({ length: 60 }, (_, i) => (
      <div
        key={i}
        className="advanced-particle"
        style={{
          "--delay": `${Math.random() * 3}s`,
          "--size": `${Math.random() * 4 + 2}px`,
          "--x": `${Math.random() * 100}%`,
          "--y": `${Math.random() * 100}%`,
          "--duration": `${Math.random() * 15 + 15}s`,
          "--hue": `${(i * 12) % 360}`,
          "--opacity": `${Math.random() * 0.3 + 0.1}`,
          "--blur": `${Math.random() * 1 + 0.5}px`,
          "--distance": `${Math.random() * 100 + 50}px`
        }}
      />
    ));

  const createMorphingText = (text) =>
    text.split("").map((char, i) => (
      <span
        key={i}
        className="morph-char"
        style={{ 
          "--delay": `${i * 0.08}s`,
          "--hue-shift": `${(i * 30) % 360}`
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  return (
    <div 
      ref={containerRef}
      className={`mobile-error-container ${deviceOrientation}`}
      style={{
        "--mouse-x": `${mousePosition.x}%`,
        "--mouse-y": `${mousePosition.y}%`
      }}
    >
      <style>
        {`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .mobile-error-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: 
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(30, 41, 59, 0.8) 0%, 
              rgba(15, 23, 42, 0.95) 40%,
              #0f172a 100%
            ),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          z-index: 10000;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: #f8fafc;
          text-align: center;
          padding: clamp(1rem, 5vw, 2rem);
          perspective: 1000px;
        }

        /* Enhanced Background Layers */
        .mobile-error-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(56, 189, 248, 0.05) 0%, 
              transparent 60%
            ),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(99, 102, 241, 0.03) 3px,
              rgba(99, 102, 241, 0.03) 4px
            );
          z-index: 1;
          opacity: 0.7;
          animation: grid-pulse 20s infinite linear;
        }

        @keyframes grid-pulse {
          0% { background-size: 150px 150px; }
          50% { background-size: 200px 200px; }
          100% { background-size: 150px 150px; }
        }

        /* Advanced Particle System */
        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .advanced-particle {
          position: absolute;
          border-radius: 50%;
          background: hsl(var(--hue), 80%, 70%);
          width: var(--size);
          height: var(--size);
          top: var(--y);
          left: var(--x);
          opacity: var(--opacity);
          filter: blur(var(--blur)) brightness(1.2);
          animation: 
            float var(--duration) ease-in-out var(--delay) infinite,
            pulse 4s ease-in-out infinite alternate;
          box-shadow: 
            0 0 calc(var(--size) * 2) hsla(var(--hue), 80%, 70%, 0.3);
          transform: translateZ(0);
        }

        @keyframes float {
          0% {
            transform: translate3d(0, 0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity);
            transform: translate3d(0, 0, 0) scale(1);
          }
          90% {
            opacity: calc(var(--opacity) * 0.8);
            transform: 
              translate3d(
                calc(sin(var(--delay)) * var(--distance)), 
                calc(cos(var(--delay)) * var(--distance)), 
                0
              ) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: 
              translate3d(
                calc(sin(var(--delay)) * var(--distance) * 1.5), 
                calc(cos(var(--delay)) * var(--distance) * 1.5), 
                0
              ) scale(0);
          }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 calc(var(--size) * 2) hsla(var(--hue), 80%, 70%, 0.3); }
          100% { box-shadow: 0 0 calc(var(--size) * 4) hsla(var(--hue), 80%, 70%, 0.5); }
        }

        /* Content Container */
        .content-wrapper {
          position: relative;
          z-index: 10;
          max-width: min(90vw, 800px);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          perspective: 1000px;
          transform-style: preserve-3d;
          transform: 
            translateZ(0)
            rotateX(calc((var(--mouse-y, 50) - 50) * 0.5deg))
            rotateY(calc((50 - var(--mouse-x, 50)) * 0.5deg));
          transition: transform 0.1s ease-out;
        }

        /* Enhanced Device Icon */
        .device-icon {
          width: clamp(80px, 20vw, 140px);
          height: clamp(80px, 20vw, 140px);
          margin-bottom: clamp(1.5rem, 5vw, 3rem);
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          animation: 
            float-device 8s ease-in-out infinite,
            glow-pulse 4s ease-in-out infinite alternate;
          filter: 
            drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))
            drop-shadow(0 0 24px rgba(168, 85, 247, 0.4));
        }

        .device-icon svg {
          width: 100%;
          height: 100%;
          fill: #94a3b8;
          opacity: 0.8;
          animation: hue-rotate 8s linear infinite;
        }

        .device-icon::before {
          content: '';
          position: absolute;
          top: -10%;
          left: -10%;
          right: -10%;
          bottom: -10%;
          background: 
            radial-gradient(circle, 
              rgba(99, 102, 241, 0.2) 0%, 
              rgba(168, 85, 247, 0.1) 50%, 
              transparent 100%
            );
          border-radius: 50%;
          animation: rotate 20s linear infinite;
          z-index: -1;
        }

        @keyframes float-device {
          0%, 100% { 
            transform: translateY(0) rotateY(0deg) rotateX(0deg);
          }
          25% { 
            transform: translateY(-8px) rotateY(5deg) rotateX(2deg);
          }
          75% { 
            transform: translateY(-4px) rotateY(-5deg) rotateX(-2deg);
          }
        }

        @keyframes glow-pulse {
          0% { 
            filter: 
              drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))
              drop-shadow(0 0 24px rgba(168, 85, 247, 0.4));
          }
          100% { 
            filter: 
              drop-shadow(0 0 24px rgba(99, 102, 241, 0.8))
              drop-shadow(0 0 48px rgba(168, 85, 247, 0.6));
          }
        }

        @keyframes hue-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Professional Error Code */
        .error-code {
          font-size: clamp(2.5rem, 8vw, 5rem);
          margin-bottom: clamp(1rem, 3vw, 2rem);
  font-weight: 800;
          position: relative;
          background: linear-gradient(
            135deg, 
            #818cf8 0%, 
            #c084fc 25%, 
            #60a5fa 50%, 
            #818cf8 75%, 
            #c084fc 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-flow 4s ease-in-out infinite;
          text-shadow: none;
          letter-spacing: -0.02em;
          transform: translateZ(30px);
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .error-code.glitch {
          animation: 
            gradient-flow 4s ease-in-out infinite,
            advanced-glitch 0.5s ease-in-out;
        }

        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes advanced-glitch {
          0% { transform: translateZ(30px); }
          10% { transform: translateZ(30px) translate3d(-1px, 1px, 0) skew(1deg); }
          20% { transform: translateZ(30px) translate3d(-1px, -1px, 0) skew(-0.5deg); }
          30% { transform: translateZ(30px) translate3d(1px, 1px, 0) skew(0.5deg); }
          40% { transform: translateZ(30px) translate3d(1px, -1px, 0) skew(-1deg); }
          50% { transform: translateZ(30px) translate3d(-0.5px, 1px, 0) skew(0.5deg) scale(1.01); }
          60% { transform: translateZ(30px) translate3d(-0.5px, -0.5px, 0) skew(-0.5deg) scale(0.99); }
          100% { transform: translateZ(30px); }
        }

        /* Enhanced Message */
        .error-message {
          font-size: clamp(1.2rem, 4vw, 1.8rem);
          margin-bottom: clamp(1rem, 3vw, 2rem);
          line-height: 1.5;
          opacity: ${textVisible ? 1 : 0};
          transform: translateY(${textVisible ? 0 : 20}px) translateZ(20px);
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s;
          font-weight: 500;
          max-width: 100%;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.02em;
          color: #e2e8f0;
        }

        .morph-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px) rotateX(90deg) scale(0.8);
          animation: morph-reveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: var(--delay);
          color: hsl(calc(220 + var(--hue-shift, 0)), 85%, 85%);
          transition: color 0.3s ease;
          font-weight: 400;
        }

        @keyframes morph-reveal {
          0% {
            opacity: 0;
            transform: translateY(20px) rotateX(90deg) scale(0.8);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-3px) rotateX(30deg) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
          }
        }

        /* Professional Coming Soon */
        .coming-soon {
          font-size: clamp(1.4rem, 5vw, 2.2rem);
          font-weight: 700;
          background: linear-gradient(
            45deg, 
            #818cf8, 
            #c084fc, 
            #60a5fa,
            #818cf8
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: ${showComingSoon ? 1 : 0};
          transform: ${showComingSoon ? 'translateZ(15px) scale(1)' : 'translateZ(15px) scale(0.9)'};
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s;
          margin-top: clamp(1rem, 3vw, 2rem);
          animation: ${showComingSoon ? 'gradient-wave 3s ease-in-out infinite, text-float 4s ease-in-out infinite' : 'none'};
          position: relative;
          padding-bottom: 12px;
        }

        .coming-soon::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #818cf8, #c084fc, transparent);
          border-radius: 2px;
          animation: ${showComingSoon ? 'line-expand 0.8s ease-out 2.3s forwards' : 'none'};
          opacity: 0;
        }

        @keyframes gradient-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes text-float {
          0%, 100% { transform: translateZ(15px) translateY(0); }
          50% { transform: translateZ(15px) translateY(-5px); }
        }

        @keyframes line-expand {
          0% { width: 0; opacity: 0; }
          100% { width: 70%; opacity: 1; }
        }

        /* Enhanced Contact Info */
        .contact-info {
          margin-top: clamp(2rem, 5vw, 3rem);
          opacity: ${showComingSoon ? 0.9 : 0};
          transform: translateY(${showComingSoon ? 0 : 15}px);
          transition: all 0.8s ease 2.2s;
          font-size: clamp(1rem, 3vw, 1.1rem);
          max-width: 100%;
          line-height: 1.7;
          text-align: center;
          color: #cbd5e1;
          font-weight: 400;
          padding: 0 10%;
        }

        .contact-info strong {
          color: #f1f5f9;
          font-weight: 600;
          background: linear-gradient(90deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Enhanced Desktop Notice */
        .desktop-notice {
          position: absolute;
          bottom: clamp(1rem, 3vh, 2rem);
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(0.8rem, 2vw, 0.95rem);
          opacity: 0.6;
          width: 90%;
          text-align: center;
          color: #94a3b8;
          background: rgba(15, 23, 42, 0.7);
          padding: 0.75rem 1.5rem;
          border-radius: 24px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(99, 102, 241, 0.15);
          box-shadow: 0 4px 20px rgba(2, 6, 23, 0.3);
          z-index: 5;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        /* Responsive Optimizations */
        @media (min-width: 768px) {
          .mobile-error-container {
            display: none;
          }
        }

        @media (max-width: 480px) and (orientation: portrait) {
          .content-wrapper {
            padding: 1rem 0.5rem;
          }
          
          .device-icon {
            margin-bottom: 1.5rem;
          }
          
          .error-message {
            font-size: 1.1rem;
            margin-bottom: 1.2rem;
          }
        }

        @media (max-width: 768px) and (orientation: landscape) {
          .mobile-error-container {
            padding: 1rem;
          }
          
          .content-wrapper {
            max-width: 95vw;
          }
          
          .device-icon {
            width: 70px;
            height: 70px;
            margin-bottom: 1rem;
          }
          
          .error-code {
            font-size: 2.2rem;
            margin-bottom: 0.8rem;
          }
          
          .error-message {
            font-size: 1rem;
            margin-bottom: 0.8rem;
          }
          
          .coming-soon {
            font-size: 1.2rem;
            margin-top: 0.8rem;
          }
          
          .contact-info {
            margin-top: 1.2rem;
            font-size: 0.9rem;
          }
        }

        @media (max-height: 600px) {
          .device-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 0.8rem;
          }
          
          .error-code {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          
          .contact-info {
            margin-top: 1rem;
          }
        }

        /* High DPI Display Optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .advanced-particle {
            filter: blur(calc(var(--blur) * 0.5)) brightness(1.3);
          }
          
          .error-code {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }

        /* Dark mode enhancements */
        @media (prefers-color-scheme: dark) {
          .mobile-error-container {
            background: 
              radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(30, 41, 59, 0.9) 0%, 
                rgba(15, 23, 42, 0.98) 40%,
                #0a0f1a 100%
              );
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .advanced-particle,
          .device-icon,
          .error-code,
          .coming-soon,
          .morph-char {
            animation: none !important;
          }
          
          .morph-char {
            animation: simple-fade-in 0.5s ease forwards !important;
            animation-delay: var(--delay) !important;
          }
          
          @keyframes simple-fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          .content-wrapper {
            transform: none !important;
          }
        }
        `}
      </style>

      <div className="particles">{createAdvancedParticles()}</div>

      <div className="content-wrapper">
        <div className="device-icon">
          <svg viewBox="0 0 24 24">
            <path d="M17,1H7C5.9,1,5,1.9,5,3v18c0,1.1,0.9,2,2,2h10c1.1,0,2-0.9,2-2V3C19,1.9,18.1,1,17,1z M17,19H7V5h10V19z"/>
            <circle cx="12" cy="18.5" r="1"/>
          </svg>
        </div>
        
        <div className={`error-code ${glitchActive ? "glitch" : ""}`}>
          UNAVAILABLE
        </div>
        
        <div className="error-message">
          {createMorphingText("We're not available on mobile devices yet")}
        </div>
        
        <div className="coming-soon">
          Mobile Experience Coming Soon
        </div>
        
        <div className="contact-info">
          For the <strong>optimal experience</strong>, please visit us on a desktop computer.
          <br />
          Our mobile-optimized version is currently in active development.
        </div>
      </div>
      
      <div className="desktop-notice">
        📱 Mobile/Tablet Detection Active • 🖥️ Desktop Required
      </div>
    </div>
  );
};

export default MobileNotSupported;