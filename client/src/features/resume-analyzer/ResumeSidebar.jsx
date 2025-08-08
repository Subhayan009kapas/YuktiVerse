import React from "react";
import {
  FiUploadCloud,
  FiArchive,
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft
} from "react-icons/fi";
import "./ResumeSidebar.css";

const ResumeSidebar = ({ onSectionChange, activeSection, isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { id: "upload", label: "Upload & Analyze", icon: <FiUploadCloud /> },
    {
      id: "history",
      label: "Previous Uploads",
      icon: <FiArchive />
    },
    { id: "roadmap", label: "Skill Roadmap", icon: <FiBarChart2 /> },
    { id: "templates", label: "Resume Templates", icon: <FiBookOpen /> },
  ];

  return (
    <div className={`resume-sidebar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      <div className="resume-sidebar">
        {!isCollapsed && (
          <>
            <div className="resume-sidebar-header">
              <h2>
                <span className="title-content">
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
                    className="icon icon-tabler icons-tabler-outline icon-tabler-tools"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
                    <path d="M14.5 5.5l4 4" />
                    <path d="M12 8l-5 -5l-4 4l5 5" />
                    <path d="M7 8l-1.5 1.5" />
                    <path d="M16 12l5 5l-4 4l-5 -5" />
                    <path d="M16 17l-1.5 1.5" />
                  </svg>
                  <span className="title-text">Resume Tools</span>
                </span>
              </h2>
            </div>
            <hr className="divider" />
            <nav className="resume-sidebar-nav">
              <ul>
                {menuItems.map((item) => (
                  <li
                    key={item.id}
                    className={`resume-nav-item ${
                      activeSection === item.id ? "active" : ""
                    }`}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <span className="resume-nav-icon">{item.icon}</span>
                    <span className="resume-nav-label">{item.label}</span>
                    <span className="resume-active-indicator"></span>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="resume-sidebar-footer">
              <p>Resume Analyzer v2.0</p>
            </div>
          </>
        )}
      </div>

      {/* Always-visible toggle button */}
      <button
        className="collapse-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        data-tooltip={isCollapsed ? "Expand" : "Collapse"}
      >
        <FiChevronLeft
          className={`collapse-icon ${isCollapsed ? "rotated" : ""}`}
        />
      </button>
    </div>
  );
};

export default ResumeSidebar;