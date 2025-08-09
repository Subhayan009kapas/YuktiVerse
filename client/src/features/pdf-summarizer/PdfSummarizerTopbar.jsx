import React, { useEffect, useState, useRef } from "react";
import "./PdfSummarizerTopbar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For redirecting after logout

const PdfSummarizerTopbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // toggle menu
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Detect clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // redirect to login page
  };

  const getAvatarContent = () => {
    if (user?.pic) {
      return (
        <img
          src={user.pic}
          alt="User Avatar"
          className="pdf-summarizer-avatar"
        />
      );
    }
    if (user?.email) {
      return (
        <div className="pdf-summarizer-avatar-fallback">
          {user.email.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <img
        src="https://i.pravatar.cc/40"
        alt="Default Avatar"
        className="pdf-summarizer-avatar"
      />
    );
  };

  return (
    <div className="pdf-summarizer-topbar">
      <div className="pdf-summarizer-topbar-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
          <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
          <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
          <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
          <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
          <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
        </svg>{" "}
        YuktiVerse PDF Summarizer
      </div>

      {/* Avatar & Menu */}
      <div className="pdf-summarizer-avatar-wrapper" ref={menuRef}>
        <div
          className="pdf-summarizer-topbar-avatar"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {getAvatarContent()}
        </div>

        {isMenuOpen && (
          <div className="pdf-summarizer-avatar-menu">
            <p>{user?.name || user?.email}</p>
            <div className="menu-divider"></div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfSummarizerTopbar;
