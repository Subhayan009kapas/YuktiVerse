import React, { useState } from "react";
import { FaShare, FaCopy, FaCheck, FaSpinner } from "react-icons/fa";
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import "./ShareButton.css";

const ShareButton = ({ notebookId, className = "", type = "notebook" , onShareLinkGenerated  }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${backendURL}/api/share/notebook/${notebookId}/generate`,
        {
          type: type,
        }
      );
      setShareUrl(response.data.shareUrl);
      console.log(response.data.shareId);
         onShareLinkGenerated();

      setShareUrl(`${__BASE_URL__}share/notebook/${response.data.shareId}`);
    } catch (error) {
      console.error("Error generating share link:", error);
      // Handle error - show toast or message
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = async () => {
    setIsOpen(true);
    if (!shareUrl) {
      await generateShareLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`share-button ${className}`}
        onClick={handleShareClick}
        title="Share notebook"
      >
        <FaShare />
      </button>

      {isOpen && (
        <div className="share-modal-overlay" onClick={handleClose}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Notebook</h3>
              <button className="close-modal" onClick={handleClose}>
                ×
              </button>
            </div>

            <div className="share-modal-content">
              {isLoading ? (
                <div className="share-loading">
                  <FaSpinner className="spin" />
                  <p>Generating share link...</p>
                </div>
              ) : shareUrl ? (
                <div className="share-link-container">
                  <p className="share-description">
                    Anyone with this link can view your notebook
                  </p>
                  <div className="share-link-input-group">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="share-link-input"
                    />
                    <button
                      className="copy-button"
                      onClick={handleCopyLink}
                      title="Copy link"
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                  {copied && (
                    <p className="copy-success">Link copied to clipboard!</p>
                  )}
                </div>
              ) : (
                <div className="share-error">
                  <p>Failed to generate share link. Please try again.</p>
                  <button onClick={generateShareLink}>Retry</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
