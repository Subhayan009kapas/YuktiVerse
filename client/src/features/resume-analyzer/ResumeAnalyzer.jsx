// resume-analyzer/ResumeAnalyzer.jsx
import React, { useState } from "react";
import ResumeSidebar from "./ResumeSidebar";
import ResumeTopbar from "./ResumeTopbar";
import ResumeUploader from "./ResumeUploader";
import ResumeFeedback from "./ResumeFeedback";
import ResumeHistory from "./ResumeHistory";
import "./ResumeAnalyzer.css";
// import Sidebar from "../../components/Sidebar";

const ResumeAnalyzer = () => {
  const [activeSection, setActiveSection] = useState("upload");
  const [extractedData, setExtractedData] = useState(null);
  const [resumeList, setResumeList] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="analyzer-container">
      <div className="double-bar-container">
        <div className="fixed-bar">
          {/* <Sidebar /> */}
        </div>
        <div className="collapse-bar">
          <ResumeSidebar
            onSectionChange={setActiveSection}
            activeSection={activeSection}
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      <div className={`resume-main-content ${isCollapsed ? "expanded" : ""}`}>
        <ResumeTopbar />
        <div className="resume-content-area">
          {activeSection === "upload" && (
            <ResumeUploader
              onSuccess={(data) => setExtractedData(data)}
              onUpdateResumeList={(list) => setResumeList(list)}
            />
          )}
          {activeSection === "history" && (
            <ResumeHistory resumes={resumeList} />
          )}
          {/* {activeSection === 'roadmap' && <SkillRoadmap />} */}
          {extractedData && <ResumeFeedback feedback={extractedData} />}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;