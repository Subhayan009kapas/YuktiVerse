import React, { useEffect, useState, useRef } from "react";
import "./ResumeTopbar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResumeTopbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editUser, setEditUser] = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setEditUser(res.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Close menu on outside click
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
    navigate("/login");
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("https://yuktiverse-mgqi.onrender.com/api/auth/update", editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(editUser);
      setIsProfileOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const getAvatarContent = () => {
    if (user?.pic) {
      return <img src={user.pic} alt="User Avatar" className="resume-avatar" />;
    }
    if (user?.email) {
      return (
        <div className="resume-avatar-fallback">
          {user.email.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <img
        src="https://i.pravatar.cc/40"
        alt="Default Avatar"
        className="resume-avatar"
      />
    );
  };

  return (
    <>
      <div className="resume-topbar">
        <div className="resume-topbar-title">
          {/* Icon */}
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
          </svg>{" "}
          <p>Resume Verse</p>
        </div>

        {/* Avatar + Menu */}
        <div className="resume-avatar-wrapper" ref={menuRef}>
          <div
            className="resume-topbar-avatar"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {getAvatarContent()}
          </div>

          {isMenuOpen && (
            <div className="resume-avatar-menu">
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

      {/* Fullscreen Profile Popup */}
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
                <h2 className="profile-name">{user?.name || "N/A"}</h2>
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

export default ResumeTopbar;
