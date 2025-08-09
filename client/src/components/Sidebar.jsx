import React, { useState, useEffect } from "react";
import { FaBook, FaFileAlt, FaUserCircle, FaMoon } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { themes } from "./theme";

const Sidebar = () => {
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem("theme") || "indigoDreams"
  );
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem("theme", themeName);
    setActiveTheme(themeName);
    setShowMenu(false);
  };

  useEffect(() => {
    applyTheme(activeTheme);
  }, []);

  return (
    <div className="tuf-sidebar">
      <ul className="tuf-sidebar-menu">
        <li className="tuf-menu-item-logo">
          <img
            src="./src/assets/750003cb-fc39-41be-a28a-be393bf1013a.jpg"
            alt=""
          />
        </li>
        <li
          className={`tuf-menu-item ${
            location.pathname === "/academic-org" ? "tuf-active" : ""
          }`}
        >
          <Link to="/academic-org">
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
              className="icon icon-tabler icons-tabler-outline icon-tabler-writing"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z" />
              <path d="M16 7h4" />
              <path d="M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3" />
            </svg>
            <span>NoteBook</span>
          </Link>
        </li>
        <li
          className={`tuf-menu-item ${
            location.pathname === "/notebook" ? "tuf-active" : ""
          }`}
        >
          <Link to="/ResumeAnalyzer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48" // Increased from 30
              height="48" // Increased from 30
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon icon-tabler icons-tabler-filled icon-tabler-file-cv"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2.5 8a2.5 2.5 0 0 0 -2.5 2.5v3a2.5 2.5 0 1 0 5 0a1 1 0 0 0 -2 0a.5 .5 0 1 1 -1 0v-3a.5 .5 0 1 1 1 0a1 1 0 0 0 2 0a2.5 2.5 0 0 0 -2.5 -2.5m6.743 .03a1 1 0 0 0 -1.213 .727l-.53 2.119l-.53 -2.119a1 1 0 1 0 -1.94 .486l1.5 6c.252 1.01 1.688 1.01 1.94 0l1.5 -6a1 1 0 0 0 -.727 -1.213m-1.244 -7.031l4.001 4.001h-4z" />
            </svg>

            <span>Resume</span>
          </Link>
        </li>
        <li
          className={`tuf-menu-item ${
            location.pathname === "/interview" ? "tuf-active" : ""
          }`}
        >
          <Link to="/Pdf_summarizer">
           <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-file-text-spark"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v3.5" /><path d="M9 9h1" /><path d="M9 13h6" /><path d="M9 17h3" /><path d="M19 22.5a4.75 4.75 0 0 1 3.5 -3.5a4.75 4.75 0 0 1 -3.5 -3.5a4.75 4.75 0 0 1 -3.5 3.5a4.75 4.75 0 0 1 3.5 3.5" /></svg>
            <span>PDF</span>
          </Link>
        </li>
      </ul>

      <div className="tuf-sidebar-bottom">
        <div
          className={`tuf-menu-item ${
            location.pathname === "/theme" ? "tuf-active" : ""
          }`}
        >
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            style={{
              padding: "16px 28px",
              color: "var(--accent-primary)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              background: "var(--color-surface)",
            }}
          >
            <FaMoon className="tuf-menu-icon" />
          </button>
        </div>
        <div
          className={`tuf-menu-item ${
            location.pathname === "/profile" ? "tuf-active" : ""
          }`}
        >
          <Link to="/profile">
            <FaUserCircle className="tuf-menu-icon" />
          </Link>
        </div>
      </div>
      {showMenu && (
        <div className="tuf-theme-menu-opt">
          {Object.keys(themes).map((name) => (
            <div
              key={name}
              onClick={() => applyTheme(name)}
              className={`tuf-theme-option ${
                activeTheme === name ? "tuf-theme-option-active" : ""
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
