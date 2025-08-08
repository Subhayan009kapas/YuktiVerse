import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResumeHistory.css";

const ResumeHistory = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(null); // New state for PDF modal
  const [deleteModal, setDeleteModal] = useState({ show: false, resumeId: null, filename: "" });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const fetchResumes = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await axios.get("http://localhost:5000/api/resume/all");
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // PDF viewer handlers
  const openPdfViewer = (url) => {
    setViewingPdf(url);
  };

  const closePdfViewer = () => {
    setViewingPdf(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (id, filename) => {
    setDeleteModal({ show: true, resumeId: id, filename });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, resumeId: null, filename: "" });
  };

  const handleDelete = async () => {
    const { resumeId } = deleteModal;
    
    try {
      await axios.delete(`http://localhost:5000/api/resume/delete/${resumeId}`);
      setResumes(resumes.filter((resume) => resume._id !== resumeId));
      if (expandedRow === resumeId) setExpandedRow(null);
      
      // Close modal and show success notification
      closeDeleteModal();
      showNotification("Resume deleted successfully!", "success");
    } catch (err) {
      closeDeleteModal();
      showNotification("Failed to delete resume. Please try again.", "error");
      console.error(err);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Download functionality
  const handleDownload = async (resume) => {
    const button = event.target.closest('.download-btn');
    if (!button) return;
    
    try {
      // Add loading state
      button.disabled = true;
      button.innerHTML = `
        <svg class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </svg>
        Downloading...
      `;
      
      const response = await fetch(resume.cloudinaryUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Success feedback
      button.classList.add('success');
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Downloaded!
      `;
      
      setTimeout(() => {
        button.disabled = false;
        button.classList.remove('success');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3v12" />
            <path d="M16 11l-4 4l-4 -4" />
            <path d="M3 12a9 9 0 0 0 18 0" />
          </svg>
          Download PDF
        `;
      }, 2000);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file. Please try again.');
      
      // Reset button state
      button.disabled = false;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 3v12" />
          <path d="M16 11l-4 4l-4 -4" />
          <path d="M3 12a9 9 0 0 0 18 0" />
        </svg>
        Download PDF
      `;
    }
  };

  // Share functionality
  const handleShare = async (resume) => {
    const button = event.target.closest('.share-btn');
    if (!button) return;
    
    try {
      // Add loading state
      button.disabled = true;
      button.innerHTML = `
        <svg class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </svg>
        Sharing...
      `;
      
      const shareData = {
        title: `Resume Analysis - ${resume.filename}`,
        text: `Check out my resume analysis results! Analysis Score: ${Math.floor(Math.random() * 30 + 70)}%`,
        url: resume.cloudinaryUrl
      };

      // Try Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy analysis summary to clipboard
        const analysisText = `
Resume Analysis Summary
File: ${resume.filename}
Analysis Score: ${Math.floor(Math.random() * 30 + 70)}%

Key Strengths:
${resume.analysisResult?.strengths?.slice(0, 3).map(item => `• ${item}`).join('\n') || '• Strong technical skills\n• Good communication\n• Leadership experience'}

Areas for Improvement:
${resume.analysisResult?.issues?.slice(0, 2).map(item => `• ${item}`).join('\n') || '• Add more quantifiable achievements\n• Improve formatting'}

Top Keywords: Leadership, JavaScript, Project Management, Communication

View full analysis: ${resume.cloudinaryUrl}
        `.trim();

        await navigator.clipboard.writeText(analysisText);
      }
      
      // Success feedback
      button.classList.add('success');
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${navigator.share && navigator.canShare(shareData) ? 'Shared!' : 'Copied!'}
      `;
      
      setTimeout(() => {
        button.disabled = false;
        button.classList.remove('success');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M8.7 10.7l6.6 -3.4" />
            <path d="M8.7 13.3l6.6 3.4" />
          </svg>
          Share Analysis
        `;
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
      
      // Reset button state
      button.disabled = false;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M8.7 10.7l6.6 -3.4" />
          <path d="M8.7 13.3l6.6 3.4" />
        </svg>
        Share Analysis
      `;
    }
  };

  return (
    <div className="resume-history-container">
      <div className="header-section">
        <h1 className="title">📁 Resume History</h1>
        <p className="subtitle">Your analyzed resumes and their insights</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your resumes...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Resumes Analyzed Yet</h3>
          <p>Upload a resume to get started with analysis</p>
        </div>
      ) : (
        <div className="resume-list">
          <div className="list-header">
            <div className="header-item file">File Name</div>
            <div className="header-item date">Date Analyzed</div>
            <div className="header-item actions">Actions</div>
          </div>

          {resumes.map((resume) => (
            <div
              key={resume._id}
              className={`resume-row ${
                expandedRow === resume._id ? "expanded" : ""
              }`}
            >
              <div className="row-main" onClick={() => toggleRow(resume._id)}>
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <h3 className="filename">{resume.filename}</h3>
                    <div className="file-meta">
                      <span className="file-size">
                        {(Math.random() * 2 + 0.5).toFixed(1)} MB
                      </span>
                      <span className="bullet">•</span>
                      <span className="analysis-score">
                        Analysis Score: {Math.floor(Math.random() * 30 + 70)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="date-info">
                  <span className="date-icon">
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
                      className="icon icon-tabler icons-tabler-outline icon-tabler-calendar-time"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
                      <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                      <path d="M15 3v4" />
                      <path d="M7 3v4" />
                      <path d="M3 11h16" />
                      <path d="M18 16.496v1.504l1 1" />
                    </svg>
                  </span>
                  <span className="date">{formatDate(resume.createdAt)}</span>
                </div>

                <div className="row-actions">
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPdfViewer(resume.cloudinaryUrl);
                    }}
                  >
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
                      className="icon icon-tabler icons-tabler-outline icon-tabler-eye-share"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M12.597 17.981a9.467 9.467 0 0 1 -.597 .019c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6c-.205 .342 -.415 .67 -.63 .983" />
                      <path d="M16 22l5 -5" />
                      <path d="M21 21.5v-4.5h-4.5" />
                    </svg>{" "}
                    View
                  </button>

                  <button
                    className="expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(resume._id);
                    }}
                  >
                    {expandedRow === resume._id ? (
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
                        className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M6 15l6 -6l6 6" />
                      </svg>
                    ) : (
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
                        className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M6 9l6 6l6 -6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

                       {expandedRow === resume._id && (
                <div className="row-details">
                  <div className="analysis-section">
                    <div className="analysis-block">
                      <h4>🧠 Key Highlights</h4>
                      <div className="highlights-grid">
                        <div className="strengths">
                          <h5>✅ Strengths</h5>
                          <ul>
                            {resume.analysisResult?.strengths
                              ?.slice(0, 3)
                              .map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                          </ul>
                        </div>

                        <div className="issues">
                          <h5>⚠️ Areas for Improvement</h5>
                          <ul>
                            {resume.analysisResult?.issues
                              ?.slice(0, 2)
                              .map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                          </ul>
                        </div>
                      </div>
                      <br></br>
                      <div className="keywords">
                        <h5>🔑 Top Keywords</h5>
                        <div className="keyword-tags">
                          {[
                            "Leadership",
                            "JavaScript",
                            "Project Management",
                            "Communication",
                          ].map((kw, i) => (
                            <span key={i} className="keyword-tag">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <br></br>

                      <div className="quick-actions">
                        <button
                          className="resume-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(resume._id, resume.filename);
                          }}
                        >
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
                            class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 7l16 0" />
                            <path d="M10 11l0 6" />
                            <path d="M14 11l0 6" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                          </svg>{" "}
                          Delete
                        </button>
                        <button 
                          className="download-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(resume);
                          }}
                        >
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
                            class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-down-to-arc"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 3v12" />
                            <path d="M16 11l-4 4l-4 -4" />
                            <path d="M3 12a9 9 0 0 0 18 0" />
                          </svg>{" "}
                          Download PDF
                        </button>
                        <button 
                          className="share-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(resume);
                          }}
                        >
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
                            class="icon icon-tabler icons-tabler-outline icon-tabler-share"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M8.7 10.7l6.6 -3.4" />
                            <path d="M8.7 13.3l6.6 3.4" />
                          </svg>{" "}
                          Share Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
         
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="pdf-modal-overlay" onClick={closePdfViewer}>
          <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>Resume Preview</h3>
              <button className="pdf-close-btn" onClick={closePdfViewer}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color="red"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="pdf-viewer">
              <object
                data={`${viewingPdf}#toolbar=0&navpanes=0`}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <div className="pdf-fallback">
                  <p>Unable to display PDF file.</p>
                  <a
                    href={viewingPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download instead
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#ff4757" strokeWidth="2" fill="none" className="delete-circle"/>
                <path d="M8 8l8 8" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" className="delete-line-1"/>
                <path d="M16 8l-8 8" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" className="delete-line-2"/>
                <path d="M12 6v12" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" className="delete-vertical"/>
                <path d="M6 12h12" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" className="delete-horizontal"/>
              </svg>
            </div>
            <h3>Delete Resume</h3>
            <p>Are you sure you want to delete <strong>"{deleteModal.filename}"</strong>?  <p>This action cannot be undone.</p> </p>
          
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleDelete}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-wavy-border"></div>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === "success" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#f44336"/>
                  <path d="M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div className="notification-text">
              <div className="notification-title">
                {notification.type === "success" ? "Success message" : "Error message"}
              </div>
              <div className="notification-message">{notification.message}</div>
            </div>
            <button className="notification-close" onClick={() => setNotification({ show: false, message: "", type: "" })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
