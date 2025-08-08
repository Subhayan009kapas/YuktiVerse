import React, { useState, useEffect } from "react";
import { FaBook, FaFileAlt, FaUserCircle, FaMoon } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { themes } from './theme';

const Sidebar = () => {
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('theme') || 'indigoDreams');
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem('theme', themeName);
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
          <img src="./src/assets/750003cb-fc39-41be-a28a-be393bf1013a.jpg" alt="" />
        </li>
        <li className={`tuf-menu-item ${location.pathname === "/academic-org" ? "tuf-active" : ""}`}>
          <Link to="/academic-org">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
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
        <li className={`tuf-menu-item ${location.pathname === "/notebook" ? "tuf-active" : ""}`}>
          <Link to="/notebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="currentColor"
              className="icon icon-tabler icons-tabler-filled icon-tabler-briefcase"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z" />
            </svg>
            <span>Job</span>
          </Link>
        </li>
        <li className={`tuf-menu-item ${location.pathname === "/interview" ? "tuf-active" : ""}`}>
          <Link to="/interview">
            <FaBook className="tuf-menu-icon" />
            <span>Map</span>
          </Link>
        </li>
      </ul>

      <div className="tuf-sidebar-bottom">
        <div className={`tuf-menu-item ${location.pathname === "/theme" ? "tuf-active" : ""}`}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            style={{
              padding: '16px 28px',
              color: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'var(--color-surface)',
            }}
          >
            <FaMoon className="tuf-menu-icon" />
          </button>
        </div>
        <div className={`tuf-menu-item ${location.pathname === "/profile" ? "tuf-active" : ""}`}>
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
              className="tuf-theme-option"
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
