import React, { useState } from "react";
import "./ResumeUploader.css";
import axios from "axios";
import ResumeFeedback from "./ResumeFeedback";
import ResumeLoader from "./ResumeLoader";

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUploader, setShowUploader] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatabaseSuccess, setShowDatabaseSuccess] = useState(false);

  // Function to handle database save success from ResumeFeedback
  const handleDatabaseSaveSuccess = () => {
    setShowDatabaseSuccess(true);
    setTimeout(() => setShowDatabaseSuccess(false), 10000);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Visual feedback
      const dropArea = document.querySelector(".upload-drop-area");
      if (dropArea) {
        dropArea.classList.add("file-added");
        setTimeout(() => dropArea.classList.remove("file-added"), 800);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Visual feedback
      const dropArea = document.querySelector(".upload-drop-area");
      if (dropArea) {
        dropArea.classList.add("file-added");
        setTimeout(() => dropArea.classList.remove("file-added"), 800);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!file) {
      // Shake animation for feedback
      const dropArea = document.querySelector(".upload-drop-area");
      if (dropArea) {
        dropArea.classList.add("shake");
        setTimeout(() => dropArea.classList.remove("shake"), 500);
      }
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setFeedback(res.data.analysis);
      setSummary(res.data.summary || null);
      
      // Show success popup
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowUploader(false);
      }, 5000);
      
    } catch (err) {
      console.error("Error uploading resume:", err);
      // Show error animation
      const uploadBox = document.querySelector(".upload-box");
      if (uploadBox) {
        uploadBox.classList.add("error");
        setTimeout(() => uploadBox.classList.remove("error"), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="resume-upload-container">
      {/* Database Save Success Popup - Full Page Blur */}
      {showDatabaseSuccess && (
        <div 
          className="database-success-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDatabaseSuccess(false);
            }
          }}
        >
          <div className="database-success-popup">
            <button 
              className="popup-close" 
              onClick={() => setShowDatabaseSuccess(false)}
              aria-label="Close popup"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="success-icon">
              <svg className="database-save-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Database container */}
                <rect className="database-container" x="15" y="20" width="50" height="40" rx="4" fill="none" stroke="#10B981" strokeWidth="2"/>
                {/* Database lines */}
                <line className="db-line-1" x1="20" y1="30" x2="60" y2="30" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
                <line className="db-line-2" x1="20" y1="40" x2="60" y2="40" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
                <line className="db-line-3" x1="20" y1="50" x2="60" y2="50" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
                {/* Save arrow */}
                <path className="save-arrow" d="M40 10L40 20M35 15L40 10L45 15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Success checkmark */}
                <path className="success-check" d="M30 45L35 50L50 35" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Data particles */}
                <circle className="particle-1" cx="25" cy="35" r="1" fill="#68D391"/>
                <circle className="particle-2" cx="55" cy="45" r="1" fill="#68D391"/>
                <circle className="particle-3" cx="30" cy="55" r="1" fill="#68D391"/>
              </svg>
            </div>
            <h3>Resume Saved Successfully!</h3>
            <p>Your resume analysis has been saved to the database and is now available for future reference.</p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup">
          <div className="popup-content">
            <div className="popup-icon">
              <svg className="analysis-checkmark" viewBox="0 0 52 52">
                <circle className="circle" cx="26" cy="26" r="25" fill="none" />
                <path className="check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                <path className="analysis-icon" fill="none" d="M26 8C16.6 8 9 15.6 9 25s7.6 17 17 17 17-7.6 17-17S35.4 8 26 8zM26 38c-7.2 0-13-5.8-13-13s5.8-13 13-13 13 5.8 13 13-5.8 13-13 13z"/>
                <path className="analysis-dots" fill="none" d="M26 18c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"/>
              </svg>
            </div>
            <h3>Analysis Complete!</h3>
            <div className="popup-file-name">
              <span className="file-icon">📄</span> 
              {file ? file.name : "Resume File"}
            </div>
            <p>Your resume has been successfully analyzed and insights are ready for review.</p>
          </div>
        </div>
      )}

      {showUploader ? (
        <div className="upload-content-wrapper">
          <div
            className={`upload-box ${dragActive ? "drag-active" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-header">
              <h1>Resume Analyzer</h1>
              <p>Upload your resume to receive instant feedback</p>
            </div>
            
            <div className="upload-drop-area">
              <div className="upload-icon">
                <div className="upload-icon-bg">
                 <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-file-cv"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2.5 8a2.5 2.5 0 0 0 -2.5 2.5v3a2.5 2.5 0 1 0 5 0a1 1 0 0 0 -2 0a.5 .5 0 1 1 -1 0v-3a.5 .5 0 1 1 1 0a1 1 0 0 0 2 0a2.5 2.5 0 0 0 -2.5 -2.5m6.743 .03a1 1 0 0 0 -1.213 .727l-.53 2.119l-.53 -2.119a1 1 0 1 0 -1.94 .486l1.5 6c.252 1.01 1.688 1.01 1.94 0l1.5 -6a1 1 0 0 0 -.727 -1.213m-1.244 -7.031l4.001 4.001h-4z" /></svg>
                </div>
              </div>
            
              <div className="upload-text">
                <h3>Drop your resume here</h3>
                <p>Supports PDF, DOC, DOCX files</p>
                <div className="or-divider">or</div>
              </div>
              
              <label className="browse-btn">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="upload-status-bar">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <p className="file-name">{file ? file.name : "No file selected"}</p>
                  <p className="file-size">{file ? formatFileSize(file.size) : ""}</p>
                </div>
              </div>
              {file && (
                <button
                  className="clear-btn"
                  onClick={() => setFile(null)}
                  title="Remove file"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18M18 6L6 18" stroke="#f56565" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            <button 
              className="upload-btn"
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? (
                <div className="upload-spinner"></div>
              ) : (
                <>
                  <span>Upload & Analyze</span>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>

          {!loading && (
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h3>Deep Analysis</h3>
                <p>Get detailed feedback on strengths and weaknesses</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <h3>Instant Results</h3>
                <p>Receive comprehensive analysis in seconds</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                  </svg>
                </div>
                <h3>Secure & Private</h3>
                <p>Your documents are never stored or shared</p>
              </div>
            </div>
          )}

          {loading && <ResumeLoader />}
        </div>
      ) : (
        <>
          <button
            className="new-upload-btn"
            onClick={() => {
              setShowUploader(true);
              setFeedback(null);
              setFile(null);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Upload
          </button>
          <ResumeFeedback
            feedback={feedback}
            resumeFile={file}
            onDatabaseSaveSuccess={handleDatabaseSaveSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ResumeUploader;