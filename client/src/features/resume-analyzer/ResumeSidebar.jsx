import React from "react";
import {
  FiUploadCloud, // New upload icon
  FiArchive, // Replaces FiClock
  FiBarChart2, // Replaces FiTrendingUp
  FiBookOpen, // Replaces FiFileText
} from "react-icons/fi";
import "./ResumeSidebar.css";

const ResumeSidebar = ({ onSectionChange, activeSection }) => {
  const menuItems = [
    { id: "upload", label: "Upload & Analyze", icon: <FiUploadCloud /> },
    {
      id: "history",
      label: "Previous Uploads",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-history"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 8l0 4l2 2" />
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>
      ),
    },
    { id: "roadmap", label: "Skill Roadmap", icon: <FiBarChart2 /> },
    { id: "templates", label: "Resume Templates", icon: <FiBookOpen /> },
  ];

  return (
    <div className="resume-sidebar">
      <div className="sidebar-header">
        <h2>Resume Tools <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-tools"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" /><path d="M14.5 5.5l4 4" /><path d="M12 8l-5 -5l-4 4l5 5" /><path d="M7 8l-1.5 1.5" /><path d="M16 12l5 5l-4 4l-5 -5" /><path d="M16 17l-1.5 1.5" /></svg></h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="active-indicator"></span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>Resume Analyzer v2.0</p>
      </div>
    </div>
  );
};

export default ResumeSidebar;
