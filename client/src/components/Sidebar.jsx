import React, { useState, useEffect, useRef } from "react";
import {
  FaBook,
  FaUserCircle,
  FaMoon,
  FaEdit,
  FaTrash,
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { themes } from "./theme"; // Assuming your themes object is in this file
import { useNavigate } from "react-router-dom";
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL; // or wherever it’s defined

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem("theme") || "Default" // Defaulting to your new 'Default' theme
  );
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const location = useLocation();
  const navigate = useNavigate();
  const themeMenuRef = useRef(null);

  const profileMenuRef = useRef(null);

  // This useEffect is fine, assuming axios is imported and backendURL is set
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${backendURL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, []);

  // CHANGE: This logic now works correctly because the ref contains the menu too.
  // Clicks inside the menu will no longer close it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("academicOrganizerData");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) {
      console.warn(`Theme "${themeName}" not found. Applying default.`);
      applyTheme("Default");
      return;
    }

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem("theme", themeName);
    setActiveTheme(themeName);
    setShowThemeMenu(false); // Close dropdown after selecting
  };

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]); // Dependency array ensures this runs only when activeTheme changes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target)
      ) {
        setShowThemeMenu(false);
      }
    };

    // Add event listener only when the menu is shown
    if (showThemeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: remove event listener when the component unmounts or menu closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showThemeMenu]);

  return (
    <div className="sidebar-container">
      <ul className="sidebar-menu">
        <li className="sidebar-logo">
          <Link to="/" title>
            <img
              src="https://i.ibb.co/5gzS19h7/Chat-GPT-Image-Aug-13-2025-12-04-20-AM-removebg-preview.png"
              alt=""
            />
          </Link>
        </li>

        <li
          className={`sidebar-menu-item ${
            location.pathname === "/feature/academic-org" ? "active" : ""
          }`}
        >
          <Link to="/feature/academic-org" title="NoteBook">
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
              className="menu-icon"
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
          className={`sidebar-menu-item ${
            location.pathname === "/feature/resume-analyzer" ? "active" : ""
          }`}
        >
          <Link to="/feature/resume-analyzer" title="Resume Analyzer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="menu-icon"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z" />
            </svg>
            <span>Resume</span>
          </Link>
        </li>

        <li
          className={`sidebar-menu-item ${
            location.pathname === "/feature/pdf-summarizer" ? "active" : ""
          }`}
        >
          <Link to="/feature/pdf-summarizer" title="PDF Summarizer">
            <FaBook className="menu-icon" />
            <span>PDF</span>
          </Link>
        </li>
      </ul>

      <div className="sidebar-bottom">
        <div className="sidebar-menu-item">
          <button
            className="theme-toggle-button"
            onClick={() => setShowThemeMenu((prev) => !prev)}
            title="Change Theme"
          >
            <FaMoon className="menu-icon" />
          </button>
        </div>
        <div
          className={`sidebar-menu-item ${
            location.pathname === "/profile" ? "active" : ""
          }`}
        >
          {/* <Link to="/profile" title="Profile">
            <FaUserCircle className="menu-icon" />
          </Link> */}
          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              className="profile-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FaUserCircle className="menu-icon" />
            </button>
            {isMenuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-image">
                    <img
                      src="https://i.ibb.co/5gzS19h7/Chat-GPT-Image-Aug-13-2025-12-04-20-AM-removebg-preview.png"
                      alt=""
                    />
                  </div>
                  <div>
                    <p className="profile-name">{user?.name || "User"}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <button onClick={handleLogout} className="logout-button">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showThemeMenu && (
        <div ref={themeMenuRef} className="theme-menu">
          {Object.keys(themes).map((themeName) => (
            <div
              key={themeName}
              onClick={() => applyTheme(themeName)}
              className={`theme-option ${
                activeTheme === themeName ? "active" : ""
              }`}
            >
              {themeName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
