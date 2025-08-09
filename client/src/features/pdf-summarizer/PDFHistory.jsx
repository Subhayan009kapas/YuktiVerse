import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FiFile,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiSearch,
} from "react-icons/fi";
import "./PDFHistory.css";

const cleanAndParseSummary = (summary) => {
  try {
    if (!summary || typeof summary !== "string") return [];

    // Remove Markdown ```json or ``` wrappers
    let cleaned = summary
      .replace(/```json|```/g, "")
      .replace(/\\r\\n|\\n|\\r/g, "") // Remove escaped newlines
      .trim();

    // Log cleaned string for debug
    console.log("✅ Cleaned Summary:", cleaned);

    // Try parsing JSON
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("❌ Failed to parse summary:", error.message);
    return [];
  }
};

// PDF Modal Component
const PDFModal = ({ url, onClose }) => {
  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal">
        <div className="pdf-modal-header">
          <h3>PDF Preview</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        <div className="pdf-preview-container">
          {url ? (
            <iframe
              src={url}
              title="PDF Preview"
              frameBorder="0"
              width="100%"
              height="100%"
            ></iframe>
          ) : (
            <div className="no-pdf">
              <FiFile size={64} />
              <p>No PDF available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Summary Modal Component
import SummaryAccordion from "./SummaryAccordion"; // <- make sure the path is correct

const SummaryModal = ({ summary, onClose }) => {
  const modalRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="summary-modal-overlay">
      <div className="summary-modal" ref={modalRef}>
        <div className="summary-modal-header">
          <div className="header-content">
            <div className="accent-bar"></div>
            <h3>Document Summary</h3>
            <div className="section-count">
              {Array.isArray(summary)
                ? `${summary.length} Sections`
                : "No Sections"}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="summary-modal-body">
          {Array.isArray(summary) ? (
            <SummaryAccordion summary={summary} />
          ) : (
            <div className="no-summary">
              <div className="empty-state-icon">📄</div>
              <p>No summary available or format incorrect.</p>
            </div>
          )}
        </div>

        <div className="summary-modal-footer">
          <button className="done-btn" onClick={onClose}>
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

// MCQ Modal Component

import { FiCheckCircle } from "react-icons/fi";

const MCQModal = ({ mcqs, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <div className="mcq-modal-overlay">
      <div className="mcq-modal">
        <div className="mcq-modal-header">
          <div className="header-content">
            <FiCheckCircle className="header-icon" />
            <h3>Multiple Choice Questions</h3>
            <div className="counter">{mcqs.length} Questions</div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="mcq-modal-body">
          {mcqs.length > 0 ? (
            <div className="mcq-accordion">
              {mcqs.map((q, i) => (
                <div
                  key={i}
                  className={`mcq-item ${activeIndex === i ? "active" : ""}`}
                >
                  <div
                    className="mcq-question-header"
                    onClick={() => toggleQuestion(i)}
                  >
                    <div className="question-info">
                      <span className="q-number">Q{i + 1}</span>
                      <span className="q-text">{q.question}</span>
                    </div>
                    <span className="accordion-icon">
                      {activeIndex === i ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </div>

                  <div
                    className={`mcq-content ${activeIndex === i ? "open" : ""}`}
                    style={{ maxHeight: activeIndex === i ? "500px" : "0" }}
                  >
                    <div className="options-container">
                      <ul className="mcq-options">
                        {q.options.map((opt, idx) => (
                          <li
                            key={idx}
                            className={`option ${
                              idx === q.answer ? "correct" : ""
                            }`}
                          >
                            <div className="option-letter">
                              {String.fromCharCode(65 + idx)}
                              {idx === q.answer && (
                                <FiCheck className="correct-icon" />
                              )}
                            </div>
                            <div className="option-text">{opt}</div>
                          </li>
                        ))}
                      </ul>

                      <div className="answer-explanation">
                        <div className="answer-header">
                          <span>Correct Answer</span>
                          <span className="correct-answer">{q.answer}</span>
                        </div>
                        {q.explanation && (
                          <div className="explanation">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-mcqs">
              <div className="empty-state-icon">?</div>
              <p>No MCQs available for this document.</p>
            </div>
          )}
        </div>

        <div className="mcq-modal-footer">
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Component
const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <FiCheck className="notification-icon" />
        <span>{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>
        <FiX size={16} />
      </button>
    </div>
  );
};

// Main PDF History Component
const PDFHistory = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [notification, setNotification] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/pdf/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Fetched documents:", res.data);
        setDocuments(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        showNotification("Failed to fetch PDF history", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;

    try {
      await axios.delete(`/api/pdf/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      showNotification("PDF deleted successfully", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("Failed to delete PDF", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openModal = (modalType, doc) => {
    setActiveModal(modalType);
    setActiveDoc(doc);
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveDoc(null);
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

  if (loading) {
    return (
      <div className="pdf-history">
        <div className="skeleton-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-icon"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-date"></div>
              <div className="skeleton-btn-group">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
              <div className="skeleton-delete"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-history">
      <h2 className="pdf-history__title">Your Saved PDFs</h2>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by document title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="pdf-grid">
        {filteredDocuments.map((doc) => (
          <div key={doc._id} className="history-card">
            <div className="card-icon" onClick={() => openModal("pdf", doc)}>
              <div className="history-upload-icon-bg">
                <svg
                  width="40"
                  height="40"
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
              <div className="icon-overlay">View</div>
            </div>

            <div className="card-content">
              <h3 className="card-title">{doc.title}</h3>
              <div className="card-date">
                <span className="date-label">Created:</span>{" "}
                {formatDate(doc.createdAt)}
              </div>

              <div className="features-accordion">
                <div
                  className="accordion-header"
                  onClick={() => toggleExpand(doc._id)}
                >
                  <span>Document Features</span>
                  {expandedId === doc._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                <div
                  className={`accordion-content ${
                    expandedId === doc._id ? "expanded" : ""
                  }`}
                >
                  <div className="feature-actions">
                    <div className="feature-btns-row">
                      <button
                        className="feature-btn summary-btn"
                        onClick={() => openModal("summary", doc)}
                        disabled={!doc.summary}
                      >
                        Summary
                      </button>
                      <button
                        className="feature-btn mcq-btn"
                        onClick={() => openModal("mcq", doc)}
                        disabled={!doc.mcqs || doc.mcqs.length === 0}
                      >
                        MCQs
                      </button>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(doc._id)}
                    >
                      <FiTrash2 size={18} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal === "pdf" && activeDoc && (
        <PDFModal url={activeDoc.cloudinaryUrl} onClose={closeModal} />
      )}

      {activeModal === "summary" && activeDoc && (
        <SummaryModal
          summary={cleanAndParseSummary(activeDoc.summary)}
          onClose={closeModal}
        />
      )}

      {activeModal === "mcq" && activeDoc && (
        <MCQModal mcqs={activeDoc.mcqs} onClose={closeModal} />
      )}
    </div>
  );
};

export default PDFHistory;
