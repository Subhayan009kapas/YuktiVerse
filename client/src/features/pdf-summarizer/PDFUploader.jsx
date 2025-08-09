import React, { useState } from "react";
import axios from "axios";
import SummarySection from "./SummarySection";
import "./PDFUploader.css";

const PDFUploader = () => {
  const [summary, setSummary] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSavedId, setPdfSavedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUploader, setShowUploader] = useState(true);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePDFChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setPdfFile(selectedFile);
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
    if (droppedFile && droppedFile.type === "application/pdf") {
      setPdfFile(droppedFile);
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

  const handleSummarize = async () => {
    if (!pdfFile) {
      // Shake animation for feedback
      const dropArea = document.querySelector(".upload-drop-area");
      if (dropArea) {
        dropArea.classList.add("shake");
        setTimeout(() => dropArea.classList.remove("shake"), 500);
      }
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setLoading(true);
      setError("");
      const res = await axios.post("/api/pdf/summarize", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Check if summary was actually generated
      if (res.data.summary && res.data.summary.trim()) {
        setSummary(res.data.summary);

        // Show success popup
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowSummaryPopup(true);
          setShowUploader(false);
        }, 3000);
      } else {
        // No summary generated
        setError(
          "Unable to generate summary. Please try with a different PDF or check if the PDF contains readable text."
        );
        setLoading(false);
      }
    } catch (err) {
      console.error("Summarize Error:", err);
      setError("Failed to summarize PDF. Please try again.");
      // Show error animation
      const uploadBox = document.querySelector(".upload-box");
      if (uploadBox) {
        uploadBox.classList.add("error");
        setTimeout(() => uploadBox.classList.remove("error"), 1000);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="pdf-upload-container">
      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup">
          <div className="popup-content">
            <div className="popup-icon">
              <svg className="analysis-checkmark" viewBox="0 0 52 52">
                <circle className="circle" cx="26" cy="26" r="25" fill="none" />
                <path
                  className="check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
                <path
                  className="analysis-icon"
                  fill="none"
                  d="M26 8C16.6 8 9 15.6 9 25s7.6 17 17 17 17-7.6 17-17S35.4 8 26 8zM26 38c-7.2 0-13-5.8-13-13s5.8-13 13-13 13 5.8 13 13-5.8 13-13 13z"
                />
                <path
                  className="analysis-dots"
                  fill="none"
                  d="M26 18c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
                />
              </svg>
            </div>
            <h3>Summary Generated!</h3>
            <div className="popup-file-name">
              <span className="file-icon">📄</span>
              {pdfFile ? pdfFile.name : "PDF File"}
            </div>
            <p>
              Your PDF has been successfully summarized and is ready for review.
            </p>
          </div>
        </div>
      )}

      {/* Summary Popup Overlay */}
      {showSummaryPopup && (
        <div
          className="summary-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSummaryPopup(false);
            }
          }}
        >
          <div className="summary-popup-content">
            <button
              className="popup-close"
              onClick={() => setShowSummaryPopup(false)}
              aria-label="Close popup"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <SummarySection
              summary={summary}
              pdfFile={pdfFile}
              onSaveSuccess={setPdfSavedId}
              pdfId={pdfSavedId}
            />
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
              <h1>PDF Summarizer</h1>
              <p>Upload your PDF to receive instant summary</p>
            </div>

            <div className="upload-drop-area">
              <div className="upload-icon">
                <div className="upload-icon-bg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H8"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="upload-text">
                <h3>Drop your PDF here</h3>
                <p>Supports PDF files only</p>
                <div className="or-divider">or</div>
              </div>

              <label className="browse-btn">
                Browse Files
                <input type="file" accept=".pdf" onChange={handlePDFChange} />
              </label>
            </div>

            <div className="upload-status-bar">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <p className="file-name">
                    {pdfFile ? pdfFile.name : "No file selected"}
                  </p>
                  <p className="file-size">
                    {pdfFile ? formatFileSize(pdfFile.size) : ""}
                  </p>
                </div>
              </div>
              {pdfFile && (
                <button
                  className="clear-btn"
                  onClick={() => setPdfFile(null)}
                  title="Remove file"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="#f56565"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="15"
                    y1="9"
                    x2="9"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="9"
                    y1="9"
                    x2="15"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              className="upload-btn"
              onClick={handleSummarize}
              disabled={loading || !pdfFile}
            >
              {loading ? (
                <div className="upload-spinner"></div>
              ) : (
                <>
                  <span>Upload & Summarize</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {!loading && (
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">
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
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <h3>Smart Analysis</h3>
                <p>Get detailed insights and key points from your PDF</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
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
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  </svg>
                </div>
                <h3>Instant Results</h3>
                <p>Receive comprehensive summary in seconds</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
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
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <h3>Secure & Private</h3>
                <p>Your documents are never stored or shared</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            className="new-upload-btn"
            onClick={() => {
              setShowUploader(true);
              setSummary("");
              setPdfFile(null);
              setShowSummaryPopup(false);
              setError("");
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12H20M12 4V20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Upload
          </button>
        </>
      )}
    </div>
  );
};

export default PDFUploader;
