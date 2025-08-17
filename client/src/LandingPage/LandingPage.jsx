import React, { useState } from "react";
import { motion } from "framer-motion";
import "./LandingPage.css";
import Particles from "../components/Particles";
import CountUp from "../components/CountUp";
import { useNavigate } from "react-router-dom";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const LandingPage = () => {
  const [isCardHovered, setIsCardHovered] = useState(false);

  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (localStorage.getItem("token")) {
      navigate("/feature/academic-org");
    } else {
      navigate("/login", { state: { from: "/feature/academic-org" } });
    }
  };

  const handleResumeVerseClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/feature/resume-analyzer");
    } else {
      navigate("/login", { state: { from: "/feature/resume-analyzer" } });
    }
  };

  const handlePDFVerseClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/feature/pdf-summarizer");
    } else {
      navigate("/login", { state: { from: "/feature/pdf-summarizer" } });
    }
  };

  const handleNoteVerseClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/feature/academic-org");
    } else {
      navigate("/login", { state: { from: "/feature/academic-org" } });
    }
  };

  const handleCodeVerseClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/feature/code-editor");
    } else {
      navigate("/login", { state: { from: "/feature/code-editor" } });
    }
  };

  // Replace the existing hero card with this new orbit component
  const FeatureOrbitHero = () => {
    const features = [
      {
        title: "AI Resume Analysis",
        desc: "Get instant insights on your resume",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2.5 8a2.5 2.5 0 0 0 -2.5 2.5v3a2.5 2.5 0 1 0 5 0a1 1 0 0 0 -2 0a.5 .5 0 1 1 -1 0v-3a.5 .5 0 1 1 1 0a1 1 0 0 0 2 0a2.5 2.5 0 0 0 -2.5 -2.5m6.743 .03a1 1 0 0 0 -1.213 .727l-.53 2.119l-.53 -2.119a1 1 0 1 0 -1.94 .486l1.5 6c.252 1.01 1.688 1.01 1.94 0l1.5 -6a1 1 0 0 0 -.727 -1.213m-1.244 -7.031l4.001 4.001h-4z" />
          </svg>
        ),
      },
      {
        title: "PDF Summarization",
        desc: "Extract key insights from documents",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
            <path d="M17 18h2" />
            <path d="M20 15h-3v6" />
            <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
          </svg>
        ),
      },
      {
        title: "Academic Notes",
        desc: "Organize and access study materials",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13 20l7 -7" />
            <path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7" />
          </svg>
        ),
      },
      {
        title: "Code Verse",
        desc: "AI-assisted coding environment",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-code"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 8l-4 4l4 4" />
            <path d="M17 8l4 4l-4 4" />
            <path d="M14 4l-4 16" />
          </svg>
        ),
      },
    ];

    return (
      <motion.div
        className="orbit-hero-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Central Globe */}
        {/* Central Globe */}
        <div className="globe-wrapper">
          <motion.div
            className="central-globe"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <div className="globe-surface">
              <div className="globe-grid-line"></div>
              <div className="globe-grid-line"></div>
              <div className="globe-grid-line"></div>
              <div className="globe-highlight"></div>
            </div>

            <motion.div
              className="globe-glow"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
          </motion.div>

          {/* Static Text (does NOT rotate) */}
          <div className="globe-name">
            <img src="https://i.ibb.co/PzPzQ98D/Chat-GPT-Image-Aug-13-2025-12-36-53-AM.png" />{" "}
            Yukti
          </div>
        </div>

        {/* Orbit Rings */}
        <div className="orbit-ring orbit-ring-1"></div>
        <div className="orbit-ring orbit-ring-2"></div>
        <div className="orbit-ring orbit-ring-3"></div>

        {/* Feature Icons */}
        {features.map((feature, index) => {
          const angle = (360 / features.length) * index;
          const radius = 180; // Orbit radius

          return (
            <motion.div
              key={index}
              className="feature-orbit-item"
              style={{
                x: Math.cos((angle * Math.PI) / 180) * radius,
                y: Math.sin((angle * Math.PI) / 180) * radius,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20 + index * 2,
                repeat: Infinity,
                ease: "linear",
              }}
              whileHover={{
                scale: 1.2,
                zIndex: 10,
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                className="feature-icon-wrapper"
                whileHover={{
                  rotate: 0,
                  scale: 1.5,
                }}
              >
                <div className="feature-icon-halo"></div>
                {feature.icon}
              </motion.div>

              <motion.div
                className="feature-tooltip"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.2 },
                }}
              >
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 40 - 20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <>
      <div className="particles-bg">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="landingpage-container">
        {/* ========== NAVBAR ========== */}
        <motion.nav
          className="landingpage-navbar"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="landingpage-logo"
            onClick={() => window.location.reload()}
          >
            YuktiVerse
          </div>
          <div className="landingpage-nav-links">
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#get-started">Get Started</a>
          </div>
          <div className="landingpage-nav-actions">
            <motion.button
              className="landingpage-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePDFVerseClick}
            >
               PDF Verse
            </motion.button>
            <motion.button
              className="landingpage-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCodeVerseClick}
            >
              Code Verse
            </motion.button>
          </div>
        </motion.nav>

        {/* ========== HERO SECTION ========== */}
        <section className="landingpage-hero">
          <div className="landingpage-hero-content">
            <motion.div
              className="landingpage-hero-text"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.span
                className="landingpage-badge"
                variants={itemVariants}
              >
               AI-Powered Learning Platform • Smart Start
              </motion.span>
              <motion.h1 variants={itemVariants}>
                Transform Your Career With <br />
                <span className="landingpage-gradient-text">YuktiVerse </span>
              </motion.h1>
              <motion.p variants={itemVariants}>
                From resume insights and AI PDF summaries to AI-powered coding (generate, debug, compete), plus job prep and a smart dashboard — all in one sleek professional platform.
              </motion.p>
              <div className="landingpage-hero-buttons">
                <motion.button
                  className="landingpage-btn-primary"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                >
                  Get Started
                </motion.button>
                <motion.button
                  className="landingpage-btn-outline"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResumeVerseClick}
                >
                  Try Analyser
                </motion.button>
              </div>
              <motion.div
                className="landingpage-hero-checks"
                variants={itemVariants}
              >
                <span>✔ AI-powered coding & learning</span>
<span>★ Practice, debug & grow your skills</span>

              </motion.div>
            </motion.div>

            <FeatureOrbitHero />
          </div>
        </section>

        {/* ========== FEATURES SECTION ========== */}
        <motion.section
          id="features"
          className="landingpage-features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div className="landing-section-header" variants={fadeInUp}>
            <h2>Everything for a Smarter Career Journey</h2>
            <p>Professional tools powered by AI to elevate your career</p>
          </motion.div>
          <div className="landingpage-feature-grid">
            {[
               {
                title: "Note Verse",
                desc: "Keep notes in the cloud with a clean dashboard.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-note"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M13 20l7 -7" />
                    <path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7" />
                  </svg>
                ),
                btn: "Open Notes",
                onClick: handleNoteVerseClick,
              },
              {
                title: "Resume Verse",
                desc: "Upload PDF, DOC, or DOCX for instant, detailed feedback.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="icon icon-tabler icons-tabler-filled icon-tabler-file-cv"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2.5 8a2.5 2.5 0 0 0 -2.5 2.5v3a2.5 2.5 0 1 0 5 0a1 1 0 0 0 -2 0a.5 .5 0 1 1 -1 0v-3a.5 .5 0 1 1 1 0a1 1 0 0 0 2 0a2.5 2.5 0 0 0 -2.5 -2.5m6.743 .03a1 1 0 0 0 -1.213 .727l-.53 2.119l-.53 -2.119a1 1 0 1 0 -1.94 .486l1.5 6c.252 1.01 1.688 1.01 1.94 0l1.5 -6a1 1 0 0 0 -.727 -1.213m-1.244 -7.031l4.001 4.001h-4z" />
                  </svg>
                ),
                btn: "Try Analyser",
                onClick: handleResumeVerseClick,
              },
              {
                title: "PDF Verse",
                desc: "Turn long documents into clear, actionable summaries.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-file-type-pdf"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
                    <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
                    <path d="M17 18h2" />
                    <path d="M20 15h-3v6" />
                    <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
                  </svg>
                ),
                btn: "Try Summarizer",
                onClick: handlePDFVerseClick,
              },
             
              {
                title: "Code Verse",
                desc: "AI-assisted coding environment with smart suggestions.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-code"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M7 8l-4 4l4 4" />
                    <path d="M17 8l4 4l-4 4" />
                    <path d="M14 4l-4 16" />
                  </svg>
                ),
                btn: "Start Coding",
                onClick: handleCodeVerseClick,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="landingpage-feature-card"
                variants={fadeInUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 30px rgba(0, 240, 255, 0.25)",
                }}
              >
                <div className="feature-icon-wrapper">
                  <motion.div
                    className="feature-icon-card"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <div className="feature-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <motion.button
                    className="landingpage-btn-outline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.onClick}
                  >
                    {item.btn}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ========== DASHBOARD PREVIEW SECTION ========== */}
        <motion.section
          id="dashboard"
          className="landingpage-dashboard"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <motion.div className="landing-section-header" variants={fadeInUp}>
            <h2>Interactive Dashboard Preview</h2>
            <p>
              A futuristic glance at analytics, resume scores, and AI
              suggestions
            </p>
          </motion.div>

          <motion.div className="dashboard-preview" variants={scaleUp}>
            {/* Left Column */}
            <div className="dashboard-left">
              <motion.div className="dashboard-card" whileHover={{ y: -5 }}>
                <h3 className="dashboard-card-title">AI Insights</h3>
                <div className="scorecard-metrics">
                  <motion.div
                    className="scorecard-metric"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="metric-value">
                      <CountUp
                        from={0}
                        to={92}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                      %
                    </div>
                    <div className="metric-label">Resume Match</div>
                  </motion.div>
                  <motion.div
                    className="scorecard-metric"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="metric-value">
                      <CountUp
                        from={0}
                        to={85}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                      %
                    </div>
                    <div className="metric-label">Skill Coverage</div>
                  </motion.div>
                  <motion.div
                    className="scorecard-metric"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="metric-value">
                      <CountUp
                        from={0}
                        to={78}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                      %
                    </div>
                    <div className="metric-label">ATS Optimization</div>
                  </motion.div>
                </div>

                <div className="total-fit-score">
                  <div className="score-header">
                    <span>Overall Career Readiness</span>
                    <span>
                      <CountUp
                        from={0}
                        to={85}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                      %
                    </span>
                  </div>
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    ></motion.div>
                  </motion.div>
                </div>
              </motion.div>

             <motion.div
  className="dashboard-card root-actions"
  whileHover={{ y: -5 }}
>
  <h3 className="dashboard-card-title">Root Actions</h3>
  <ul className="action-list">
    {/* ✅ Secure Resume Storage */}
    <motion.li whileHover={{ x: 5 }}>
      <div className="action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-database-import"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3" />
          <path d="M4 6v6c0 1.657 3.582 3 8 3c.856 0 1.68 -.05 2.454 -.144m5.546 -2.856v-6" />
          <path d="M4 12v6c0 1.657 3.582 3 8 3c.171 0 .341 -.002 .51 -.006" />
          <path d="M19 22v-6" />
          <path d="M22 19l-3 -3l-3 3" />
        </svg>
      </div>
      <div className="action-content">
        <strong>Secure Resume Storage</strong>
        <p>
          Save and access all your resumes for future job applications
        </p>
      </div>
    </motion.li>

    {/* ✅ Academic Note Storage */}
    <motion.li whileHover={{ x: 5 }}>
      <div className="action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-cloud-storm"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
          <path d="M13 14l-2 4l3 0l-2 4" />
        </svg>
      </div>
      <div className="action-content">
        <strong>Academic Note Storage</strong>
        <p>Store and organize your academic notes in one place</p>
      </div>
    </motion.li>

    {/* ✅ PDF Summarization */}
    <motion.li whileHover={{ x: 5 }}>
      <div className="action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-file-text-ai"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M10 21h-3a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v3.5" />
          <path d="M9 9h1" />
          <path d="M9 13h2.5" />
          <path d="M9 17h1" />
          <path d="M14 21v-4a2 2 0 1 1 4 0v4" />
          <path d="M14 19h4" />
          <path d="M21 15v6" />
        </svg>
      </div>
      <div className="action-content">
        <strong>PDF Summarization</strong>
        <p>Quickly get AI-generated summaries of lengthy PDFs</p>
      </div>
    </motion.li>

    {/* ✅ NEW: CodeVerse */}
    <motion.li whileHover={{ x: 5 }}>
      <div className="action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-code"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 8l-4 4l4 4" />
          <path d="M17 8l4 4l-4 4" />
          <path d="M14 4l-4 16" />
        </svg>
      </div>
      <div className="action-content">
        <strong>Code Verse</strong>
        <p>
          Debug errors, generate clean code, and take part in coding contests
          with AI assistance
        </p>
      </div>
    </motion.li>
  </ul>
</motion.div>

            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              <motion.div
                className="dashboard-card ai-suggestions"
                whileHover={{ y: -5 }}
              >
                <h3 className="dashboard-card-title">Code Verse Suggestions</h3>
                <div className="suggestion-content">
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Debug code instantly with AI-powered error detection and
                    fixes.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    Generate clean, optimized code snippets for your projects.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Compete in coding contests and sharpen your problem-solving
                    skills.
                  </motion.p>
                </div>
              </motion.div>

              <div className="dashboard-right-grid">
                <motion.div
                  className="dashboard-card suitable-roles"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="dashboard-card-title">Suitable Roles</h3>
                  <div className="role-tags">
                    <motion.span
                      className="role-tag"
                      whileHover={{ scale: 1.05 }}
                    >
                      Frontend Engineer
                    </motion.span>
                    <motion.span
                      className="role-tag"
                      whileHover={{ scale: 1.05 }}
                    >
                      Product Analyst
                    </motion.span>
                    <motion.span
                      className="role-tag"
                      whileHover={{ scale: 1.05 }}
                    >
                      Data Engineer
                    </motion.span>
                  </div>
                </motion.div>

                <motion.div
                  className="dashboard-card progress-card"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="dashboard-card-title">Progress</h3>
                  <div className="progress-content">
                    <motion.div
                      className="progress-item"
                      initial="hidden"
                      whileInView="visible"
                      variants={fadeInUp}
                    >
                      <span>Profile</span>
                      <div className="progress-bar small">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 1 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      </div>
                      <span>
                        <CountUp
                          from={0}
                          to={75}
                          separator=","
                          direction="up"
                          duration={1}
                          className="count-up-text"
                        />
                        %
                      </span>
                    </motion.div>
                    <motion.div
                      className="progress-item"
                      initial="hidden"
                      whileInView="visible"
                      variants={fadeInUp}
                    >
                      <span>Resume</span>
                      <div className="progress-bar small">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: "90%" }}
                          transition={{ duration: 1, delay: 0.2 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      </div>
                      <span>
                        <CountUp
                          from={0}
                          to={90}
                          separator=","
                          direction="up"
                          duration={1}
                          className="count-up-text"
                        />
                        %
                      </span>
                    </motion.div>
                  </div>
                </motion.div>

             <motion.div
  className="dashboard-card resources"
  whileHover={{ y: -5 }}
  initial="hidden"
  whileInView="visible"
  variants={fadeInUp}
>
  <h3 className="dashboard-card-title">Resources</h3>
  <ul className="resource-list">
    <motion.li whileHover={{ x: 5 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="icon icon-tabler icons-tabler-filled icon-tabler-file-cv"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2.5 8a2.5 2.5 0 0 0 -2.5 2.5v3a2.5 2.5 0 1 0 5 0a1 1 0 0 0 -2 0a.5 .5 0 1 1 -1 0v-3a.5 .5 0 1 1 1 0a1 1 0 0 0 2 0a2.5 2.5 0 0 0 -2.5 -2.5m6.743 .03a1 1 0 0 0 -1.213 .727l-.53 2.119l-.53 -2.119a1 1 0 1 0 -1.94 .486l1.5 6c.252 1.01 1.688 1.01 1.94 0l1.5 -6a1 1 0 0 0 -.727 -1.213m-1.244 -7.031l4.001 4.001h-4z" />
      </svg>
      AI Resume Analyzer
    </motion.li>

    <motion.li whileHover={{ x: 5 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-file-type-pdf"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
        <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
        <path d="M17 18h2" />
        <path d="M20 15h-3v6" />
        <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
      </svg>
      PDF Summarizer
    </motion.li>

    <motion.li whileHover={{ x: 5 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-note"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M13 20l7 -7" />
        <path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7" />
      </svg>
      Academic Notes Storage
    </motion.li>

    {/* ✅ New Coding Option */}
    <motion.li whileHover={{ x: 5 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-code"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 8l-4 4l4 4" />
        <path d="M17 8l4 4l-4 4" />
        <path d="M14 4l-4 16" />
      </svg>
      Code Verse (Coding & Debugging)
    </motion.li>
  </ul>
</motion.div>

              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ========== CALL TO ACTION ========== */}
        <motion.section
          className="landingpage-cta"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h2>Level Up Your Career With Confidence</h2>
            <p>Start with a professional resume analysis today</p>
            <div className="landingpage-cta-buttons">
              <motion.button
                className="landingpage-btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResumeVerseClick}
              >
                Upload Resume
              </motion.button>
              <motion.button
                className="landingpage-btn-outline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePDFVerseClick}
              >
                Try Summarizer
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* ========== FOOTER ========== */}
        <motion.footer
          className="landingpage-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="footer-content">
            <div className="footer-brand">
              <div className="landingpage-logo">YuktiVerse</div>
              <p>AI-powered career acceleration platform</p>
              <div className="footer-social">
                <motion.a href="#twitter" whileHover={{ y: -3 }}>
                  Twitter
                </motion.a>
                <motion.a href="#linkedin" whileHover={{ y: -3 }}>
                  LinkedIn
                </motion.a>
                <motion.a href="#github" whileHover={{ y: -3 }}>
                  GitHub
                </motion.a>
              </div>
            </div>

            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <motion.a href="#features" whileHover={{ x: 5 }}>
                  Features
                </motion.a>
                <motion.a href="#dashboard" whileHover={{ x: 5 }}>
                  Dashboard
                </motion.a>
                <motion.a href="#pricing" whileHover={{ x: 5 }}>
                  Pricing
                </motion.a>
              </div>

              <div className="link-group">
                <h4>Resources</h4>
                <motion.a href="#blog" whileHover={{ x: 5 }}>
                  Blog
                </motion.a>
                <motion.a href="#tutorials" whileHover={{ x: 5 }}>
                  Tutorials
                </motion.a>
                <motion.a href="#support" whileHover={{ x: 5 }}>
                  Support
                </motion.a>
              </div>

              <div className="link-group">
                <h4>Company</h4>
                <motion.a href="#about" whileHover={{ x: 5 }}>
                  About Us
                </motion.a>
                <motion.a href="#careers" whileHover={{ x: 5 }}>
                  Careers
                </motion.a>
                <motion.a href="#contact" whileHover={{ x: 5 }}>
                  Contact
                </motion.a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 YuktiVerse. All rights reserved.</p>
            <div className="legal-links">
              <motion.a href="#privacy" whileHover={{ y: -2 }}>
                Privacy Policy
              </motion.a>
              <motion.a href="#terms" whileHover={{ y: -2 }}>
                Terms of Service
              </motion.a>
              <motion.a href="#cookies" whileHover={{ y: -2 }}>
                Cookie Policy
              </motion.a>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default LandingPage;
