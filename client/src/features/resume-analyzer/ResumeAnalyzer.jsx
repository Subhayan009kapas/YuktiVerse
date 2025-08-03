// resume-analyzer/ResumeAnalyzer.jsx
import React, { useState } from 'react';
import ResumeSidebar from './ResumeSidebar';
import ResumeTopbar from './ResumeTopbar';
import ResumeUploader from './ResumeUploader';
import ResumeFeedback from './ResumeFeedback';
import ResumeHistory from './ResumeHistory';
// import SkillRoadmap from './SkillRoadmap';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const [activeSection, setActiveSection] = useState('upload');
  const [extractedData, setExtractedData] = useState(null);
  const [resumeList, setResumeList] = useState([]);

  return (
    <div className="analyzer-container">
      <ResumeSidebar onSectionChange={setActiveSection} activeSection={activeSection} />
      <div className="main-content">
        <ResumeTopbar />
        <div className="content-area">
          {activeSection === 'upload' && (
            <ResumeUploader
              onSuccess={(data) => setExtractedData(data)}
              onUpdateResumeList={(list) => setResumeList(list)}
            />
          )}
          {activeSection === 'history' && <ResumeHistory resumes={resumeList} />}
          {/* {activeSection === 'roadmap' && <SkillRoadmap />} */}
          {extractedData && <ResumeFeedback feedback={extractedData} />}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
