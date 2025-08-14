import React, { useEffect, useState, useRef } from "react";
import "./PdfSummarizerTopbar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For redirecting after logout

const PdfSummarizerTopbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // toggle menu
  const menuRef = useRef(null);
  const navigate = useNavigate();
   const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
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
      <>
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

            <div className="text-con">
              <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>

               <p  onClick={() => {
                  setIsProfileOpen(true);
                  setIsMenuOpen(false);
                }}>{user?.name || user?.email}</p>
            </div>
           


            <div className="menu-divider"></div>
           <div className="out">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
                 <button onClick={handleLogout}>Logout</button>
              </div>
          </div>
        )}
      </div>
    </div>

      {isProfileOpen && (
        <div className="profile-popup-overlay">
          <div className="profile-popup-card">
            <button
              className="profile-popup-close"
              onClick={() => setIsProfileOpen(false)}
            >
              ✕
            </button>

            <div className="profile-header">
              <img
                className="profile-avatar"
                src={user?.pic || "https://i.pravatar.cc/150"}
                alt="Avatar"
              />
              <div>
                <h2 className="profile-name" >{user?.name || "N/A"}</h2>
                <p className="profile-email">{user?.email || "N/A"}</p>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-details">
              <p>
                <strong>Profile Picture URL:</strong> {user?.pic || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

        
        </>
        


    



  );
};

export default PdfSummarizerTopbar;
