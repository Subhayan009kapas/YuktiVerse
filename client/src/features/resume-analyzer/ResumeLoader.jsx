import React from 'react';
import './ResumeLoader.css';

const ResumeLoader = () => {
  return (
    <div className="resume-loader-container">
      <div className="resume-loader"></div>
      <p>⏳ Scanning your resume...</p>
    </div>
  );
};

export default ResumeLoader;
