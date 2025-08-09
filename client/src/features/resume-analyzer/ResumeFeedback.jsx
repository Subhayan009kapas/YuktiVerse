import React, { useState, useEffect } from "react";
import "./ResumeFeedback.css";

const ResumeFeedback = ({ feedback, resumeFile, onDatabaseSaveSuccess }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (feedback) {
      setIsVisible(true);
    }
  }, [feedback]);

  if (!feedback) return null;

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveError(false);

    try {
      // Create FormData to match the controller expectations
      const formData = new FormData();

      // Add the resume file
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      // Add the analysis as a string (controller expects JSON string)
      formData.append("analysis", JSON.stringify(feedback));

      // Make API call to save to database
      const response = await fetch("http://localhost:5000/api/resume/save", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ send token
        },
        body: formData,
      });

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save to database");
        } else {
          // Handle HTML error responses
          const errorText = await response.text();
          console.error("Server returned HTML instead of JSON:", errorText);
          throw new Error("Server error - please try again");
        }
      }

      const result = await response.json();

      setSaveSuccess(true);
      setIsSaving(false);

      if (onDatabaseSaveSuccess) {
        onDatabaseSaveSuccess();
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving to database:", error);
      setSaveError(true);
      setIsSaving(false);
      setTimeout(() => setSaveError(false), 3000);
    }
  };

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const renderArcProgress = (score, label, color = "#68d391") => {
    const percentage = Math.min(Math.max(score, 0), 100);
    const radius = 60;
    const strokeWidth = 12;
    const circumference = Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="arc-progress-item">
        <div className="arc-progress-wrapper">
          <svg width="140" height="80" viewBox="0 0 140 80">
            {/* Background arc */}
            <path
              d={`M 10 70 A ${radius} ${radius} 0 0 1 130 70`}
              fill="none"
              stroke="#374151"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={`M 10 70 A ${radius} ${radius} 0 0 1 130 70`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="arc-progress-content">
            <div className="progress-text"></div>
            <div className="progress-status">{percentage}%</div>
          </div>
        </div>
        <div className="arc-progress-label">{label}</div>
      </div>
    );
  };

  const renderAccordionSection = (title, items, icon, color = "#68d391") => (
    <div
      className={`feedback-section ${activeSection === title ? "open" : ""}`}
    >
      <div className="feedback-heading" onClick={() => toggleSection(title)}>
        <div className="feedback-icon" style={{ color }}></div>
        <div className="feedback-title">
          <h4>
            {" "}
            {title}
            {icon}
          </h4>
        </div>
        <div className="section-count">({items?.length || 0} items)</div>
        <div className="accordion-arrow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>

      <div className="feedback-content">
        <div className="content-wrapper">
          <ul className="feedback-list">
            {items?.map((item, idx) => (
              <li
                key={idx}
                className="feedback-item"
                style={{
                  animationDelay: `${idx * 0.2}s`,
                  opacity: activeSection === title ? 1 : 0,
                  transform:
                    activeSection === title
                      ? "translateX(0)"
                      : "translateX(-40px)",
                }}
              >
                <div className="item-bullet">•</div>
                <div className="item-text">{highlightKeywords(item)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const highlightKeywords = (text) => {
    // Define keywords to highlight
    const keywords = [
      "React",
      "JavaScript",
      "Python",
      "Java",
      "Node.js",
      "Express",
      "MongoDB",
      "MySQL",
      "HTML",
      "CSS",
      "Git",
      "Docker",
      "AWS",
      "API",
      "REST",
      "GraphQL",
      "TypeScript",
      "Angular",
      "Vue",
      "Redux",
      "Context",
      "Hooks",
      "Jest",
      "Testing",
      "CI/CD",
      "Agile",
      "Scrum",
      "Kanban",
      "Leadership",
      "Management",
      "Communication",
      "Problem Solving",
      "Analytical",
      "Creative",
      "Innovation",
      "Collaboration",
    ];

    // Split text and highlight keywords
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      const trimmedPart = part.trim();
      if (
        keywords.some((keyword) =>
          trimmedPart.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return (
          <strong key={index} className="keyword-highlight">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`resume-feedback-container ${isVisible ? "fade-in" : ""}`}>
      {/* Header Section */}
      <div className="feedback-header">
        <div className="header-content" id="header-content">
          <h2>Resume Analysis Results</h2>
        </div>
      </div>

      {/* Progress Section */}
      <div className="feedback-progress">
        <div className="progress-container">
          <h3>Analysis Overview</h3>
          <div className="arc-progress-grid">
            {renderArcProgress(75, "Overall Score", "#68d391")}
            {renderArcProgress(80, "Content Quality", "#81e6d9")}
            {renderArcProgress(70, "Format & Structure", "#fbbf24")}
            {renderArcProgress(85, "Technical Skills", "#f87171")}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="analysis-results">
        <h3>Detailed Analysis</h3>

        {renderAccordionSection(
          "Strengths",
          feedback.strengths,
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
            class="icon icon-tabler icons-tabler-outline icon-tabler-gymnastics"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 7a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
            <path d="M13 21l1 -9l7 -6" />
            <path d="M3 11h6l5 1" />
            <path d="M11.5 8.5l4.5 -3.5" />
          </svg>,
          "#10b981"
        )}
        {renderAccordionSection(
          "Issues",
          feedback.issues,
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
            class="icon icon-tabler icons-tabler-outline icon-tabler-alert-square-rounded"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>,
          "#f59e0b"
        )}
        {renderAccordionSection(
          "Suggestions",
          feedback.suggestions,
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
            class="icon icon-tabler icons-tabler-outline icon-tabler-brain"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
            <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
            <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
            <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
            <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
            <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
          </svg>,
          "#3b82f6"
        )}
        {renderAccordionSection(
          "Recommended Roles",
          feedback.recommendedRoles,
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="icon icon-tabler icons-tabler-filled icon-tabler-briefcase"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z" />
          </svg>,
          "#8b5cf6"
        )}
      </div>

      {/* Save Button */}
      <div className="save-button-container">
        <button
          className={`save-button ${isSaving ? "saving" : ""}`}
          onClick={handleSaveToDatabase}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="save-spinner"></div>
              Saving to Database...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              Save to Database
            </>
          )}
        </button>

        {saveSuccess && (
          <div className="save-success-msg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
            Successfully saved to database!
          </div>
        )}

        {saveError && (
          <div className="save-error-msg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Failed to save. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeFeedback;
