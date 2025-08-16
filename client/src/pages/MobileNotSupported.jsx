import React, { useState, useEffect, useCallback, useRef } from "react";
import "./MobileNotSupported.css";

const MobileNotSupported = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentGlitch, setCurrentGlitch] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [deviceType, setDeviceType] = useState('mobile');
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  // Enhanced mouse tracking with smooth interpolation
  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition(prev => ({
        x: prev.x + (x - prev.x) * 0.1,
        y: prev.y + (y - prev.y) * 0.1
      }));
    }
  }, []);

  // Device detection with orientation support
  const detectDevice = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    
    if (width <= 480) {
      setDeviceType(isLandscape ? 'mobile-landscape' : 'mobile-portrait');
    } else if (width <= 1024) {
      setDeviceType(isLandscape ? 'tablet-landscape' : 'tablet-portrait');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => setIsLoaded(true), 200);
    
    // Advanced glitch system
    const createGlitchSequence = () => {
      const sequences = [0, 1, 2, 3, 4];
      let currentIndex = 0;
      
      const triggerGlitch = () => {
        setCurrentGlitch(sequences[currentIndex]);
        currentIndex = (currentIndex + 1) % sequences.length;
        
        setTimeout(() => setCurrentGlitch(0), 400);
        
        const nextDelay = Math.random() * 6000 + 3000;
        setTimeout(triggerGlitch, nextDelay);
      };

      setTimeout(triggerGlitch, 2000);
    };

    createGlitchSequence();
    detectDevice();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', detectDevice, { passive: true });
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, [handleMouseMove, detectDevice]);

  // Advanced particle system
  const generateParticles = () => {
    return Array.from({ length: 80 }, (_, i) => {
      const delay = Math.random() * 5;
      const duration = Math.random() * 20 + 15;
      const size = Math.random() * 3 + 1;
      const hue = (i * 137.5) % 360; // Golden angle for optimal distribution
      
      return (
        <div
          key={i}
          className="mns-particle"
          style={{
            '--mns-particle-delay': `${delay}s`,
            '--mns-particle-duration': `${duration}s`,
            '--mns-particle-size': `${size}px`,
            '--mns-particle-hue': hue,
            '--mns-particle-x': `${Math.random() * 100}%`,
            '--mns-particle-y': `${Math.random() * 100}%`,
            '--mns-particle-end-x': `${Math.random() * 100}%`,
            '--mns-particle-end-y': `${Math.random() * 100}%`,
          }}
        />
      );
    });
  };

  // Animated text with stagger effect
  const createAnimatedText = (text, className = '') => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={`mns-char ${className}`}
        style={{ '--mns-char-delay': `${i * 0.05}s` }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div 
      ref={containerRef}
      className={`mns-container ${deviceType} ${isLoaded ? 'mns-loaded' : ''}`}
      style={{
        '--mns-mouse-x': `${mousePosition.x}%`,
        '--mns-mouse-y': `${mousePosition.y}%`
      }}
    >
      {/* Dynamic Background Layers */}
      <div className="mns-bg-layer mns-bg-primary"></div>
      <div className="mns-bg-layer mns-bg-secondary"></div>
      <div className="mns-bg-layer mns-bg-grid"></div>
      
      {/* Advanced Particle System */}
      <div className="mns-particles-container">
        {generateParticles()}
      </div>
      
      {/* Floating Elements */}
      <div className="mns-floating-elements">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="mns-floating-element"
            style={{
              '--mns-float-delay': `${i * 0.8}s`,
              '--mns-float-duration': `${Math.random() * 10 + 15}s`,
              '--mns-float-x': `${Math.random() * 100}%`,
              '--mns-float-y': `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="mns-content">
        {/* Hero Icon */}
        <div className="mns-hero-icon">
          <div className="mns-icon-container">
            <svg className="mns-device-icon" viewBox="0 0 24 24">
              <path d="M17,1H7C5.9,1,5,1.9,5,3v18c0,1.1,0.9,2,2,2h10c1.1,0,2-0.9,2-2V3C19,1.9,18.1,1,17,1z M17,19H7V5h10V19z"/>
              <circle cx="12" cy="18.5" r="1"/>
            </svg>
            <div className="mns-icon-glow"></div>
            <div className="mns-icon-rings">
              <div className="mns-ring mns-ring-1"></div>
              <div className="mns-ring mns-ring-2"></div>
              <div className="mns-ring mns-ring-3"></div>
            </div>
          </div>
        </div>

        {/* Status Code */}
        <div className={`mns-status-code ${currentGlitch > 0 ? `mns-glitch-${currentGlitch}` : ''}`}>
          <div className="mns-status-text">
            {createAnimatedText('503', 'mns-status-char')}
          </div>
          <div className="mns-status-subtitle">
            {createAnimatedText('SERVICE UNAVAILABLE')}
          </div>
        </div>

        {/* Main Message */}
        <div className="mns-message">
          <div className="mns-message-primary">
            {createAnimatedText('Mobile Experience Under Construction')}
          </div>
          <div className="mns-message-secondary">
            {createAnimatedText('Our mobile platform is being engineered for optimal performance')}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mns-cta">
          <div className="mns-cta-badge">
            <span className="mns-cta-icon">🚀</span>
            <span className="mns-cta-text">Coming Soon</span>
            <div className="mns-cta-pulse"></div>
          </div>
          
          <div className="mns-recommendation">
            <div className="mns-rec-icon">💻</div>
            <div className="mns-rec-content">
              <div className="mns-rec-title">Best Experience Available</div>
              <div className="mns-rec-desc">Visit us on desktop for the full experience</div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mns-progress">
          <div className="mns-progress-bar">
            <div className="mns-progress-fill"></div>
            <div className="mns-progress-glow"></div>
          </div>
          <div className="mns-progress-text">Development in progress...</div>
        </div>
      </div>

      {/* Footer Info */}
      {/* <div className="mns-footer">
        <div className="mns-device-info">
          <span className="mns-device-indicator"></span>
          <span className="mns-device-text">
            {deviceType.includes('mobile') ? '📱 Mobile' : 
             deviceType.includes('tablet') ? '📋 Tablet' : '🖥️ Desktop'} Device Detected
          </span>
        </div>
      </div> */}

      {/* Ambient Light Effects */}
      <div className="mns-ambient-lights">
        <div className="mns-light mns-light-1"></div>
        <div className="mns-light mns-light-2"></div>
        <div className="mns-light mns-light-3"></div>
      </div>
    </div>
  );
};

export default MobileNotSupported;