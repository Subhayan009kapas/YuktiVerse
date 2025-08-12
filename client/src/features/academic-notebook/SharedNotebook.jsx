import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Rnd } from "react-rnd";
import "./SharedNotebook.css";
import axios from "axios";
import { SquaresLoader } from "../../components/Loader";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import {
  FaEye,
  FaShare,
  FaCopy,
  FaUser,
  FaClock,
  FaExpand,
  FaCompress,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
// import '../../assets/750003cb-fc39-41be-a28a-be393bf1013a.jpg'

const SharedNotebook = () => {
  const { shareId } = useParams();
  const [notebook, setNotebook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const loadSharedNotebook = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${backendURL}/api/share/notebook/${shareId}`);
        setNotebook(response.data);
        console.log("Notebook type:", response.data?.type);
        console.log("Notebook content:", response.data?.content);

        setUserId(response.data.userId || "Anonymous");
      } catch (error) {
        console.error("Error loading shared notebook:", error);
        setError(error.response?.data?.message || "Failed to load notebook");
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      loadSharedNotebook();
    }
  }, [shareId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Check file type and render accordingly
  const renderContent = () => {
    if (!notebook?.content && !notebook?.fileUrl) {
      return (
        <div className="empty-notebook">
          <div className="empty-icon">📝</div>
          <h3>Empty Notebook</h3>
          <p>This notebook doesn't contain any content yet.</p>
        </div>
      );
    }

    const fileType = notebook.type?.toLowerCase();

    // Check if it's a PDF
    if (
      fileType === "pdf" ||
      notebook.fileType === "pdf" ||
      notebook.fileUrl?.endsWith(".pdf")
    ) {
      return renderPDF();
    }

    // Check if it's an image
    if (
      fileType === "image" ||
      fileType === "img" ||
      notebook.fileType === "image" ||
      notebook.fileUrl?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)
    ) {
      return renderImage();
    }

    // Default: render as text boxes (current implementation)
    return renderTextBoxes();
  };

  // PDF renderer
  const renderPDF = () => {
    const pdfUrl =
      notebook.fileUrl || notebook.content?.fileUrl || notebook.content?.url;

    if (!pdfUrl) {
      return (
        <div className="empty-notebook">
          <div className="empty-icon">
            <FaFilePdf />
          </div>
          <h3>PDF Not Found</h3>
          <p>The PDF file could not be loaded.</p>
        </div>
      );
    }

    return (
      <div className="shared-pdf-container">
        <div className="pdf-viewer">
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title={notebook.title || "Shared PDF"}
            className="pdf-iframe"
          >
            <p>
              Your browser does not support PDFs.
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Download the PDF
              </a>
            </p>
          </iframe>
        </div>
      </div>
    );
  };

  // Image renderer
  const renderImage = () => {
    const imageUrl =
      notebook.fileUrl || notebook.content?.fileUrl || notebook.content?.url;

    if (!imageUrl) {
      return (
        <div className="empty-notebook">
          <div className="empty-icon">
            <FaImage />
          </div>
          <h3>Image Not Found</h3>
          <p>The image file could not be loaded.</p>
        </div>
      );
    }

    return (
      <div className="shared-image-container">
        <div className="image-viewer">
          <img
            src={imageUrl}
            alt={notebook.title || "Shared Image"}
            className="shared-image"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              margin: "auto",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div className="image-error" style={{ display: "none" }}>
            <FaImage />
            <p>Failed to load image</p>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              View original
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Original text boxes renderer (default)
  const renderTextBoxes = () => {
    if (
      !notebook?.content?.textBoxes ||
      notebook.content.textBoxes.length === 0
    ) {
      return (
        <div className="empty-notebook">
          <div className="empty-icon">📝</div>
          <h3>Empty Notebook</h3>
          <p>This notebook doesn't contain any notes yet.</p>
        </div>
      );
    }

    const textBoxes = notebook.content.textBoxes;

    // Get viewport dimensions to determine center point
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Define reduction factor (you can adjust this value)
    const reductionFactor = 100; // pixels to reduce

    const adjustTextBoxPosition = (x, y) => {
      let adjustedX = x || 0;
      let adjustedY = y || 0;

      // Determine which quadrant the point is in
      if (adjustedX < centerX && adjustedY < centerY) {
        // Quadrant II (top-left): reduce both x and y by 1x
        adjustedX -= reductionFactor;
        adjustedY -= reductionFactor;
      } else if (adjustedX >= centerX && adjustedY < centerY) {
        // Quadrant I (top-right): reduce x by 2x, y by 1x
        adjustedX -= reductionFactor * 2;
        adjustedY -= reductionFactor;
      } else if (adjustedX < centerX && adjustedY >= centerY) {
        // Quadrant III (bottom-left): reduce x by 1x, y by 2x
        adjustedX -= reductionFactor;
        adjustedY -= reductionFactor * 2;
      } else if (adjustedX >= centerX && adjustedY >= centerY) {
        // Quadrant IV (bottom-right): reduce x by 2x, y by 2x
        adjustedX -= reductionFactor * 2;
        adjustedY -= reductionFactor * 2;
      }

      // Ensure positions don't go negative
      adjustedX = Math.max(0, adjustedX);
      adjustedY = Math.max(0, adjustedY);

      return { x: adjustedX, y: adjustedY };
    };

    return textBoxes.map((box, index) => {
      const originalX = box.x || 0;
      const originalY = box.y || 0;

      // Apply quadrant-based adjustment
      const { x: adjustedX, y: adjustedY } = adjustTextBoxPosition(
        originalX,
        originalY
      );

      return (
        <Rnd
          key={box.id || index}
          position={{ x: adjustedX, y: adjustedY }}
          size={{ width: box.width || 280, height: box.height || 120 }}
          disableDragging={true}
          enableResizing={false}
          className="shared-text-box-container"
          style={{ zIndex: box.zIndex || index + 1 }}
        >
          <div className="shared-text-box">
            <div className="text-content">{box.text || "Empty note"}</div>
            <div className="box-indicator">
              <span className="box-number">{index + 1}</span>
            </div>
          </div>
        </Rnd>
      );
    });
  };

  // Get content stats based on type
  const getContentStats = () => {
    const fileType = notebook?.type?.toLowerCase();

    if (
      fileType === "pdf" ||
      notebook?.fileType === "pdf" ||
      notebook?.fileUrl?.endsWith(".pdf")
    ) {
      return "PDF Document";
    }

    if (
      fileType === "image" ||
      fileType === "img" ||
      notebook?.fileType === "image" ||
      notebook?.fileUrl?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)
    ) {
      return "Image File";
    }

    return `${notebook?.content?.textBoxes?.length || 0} notes`;
  };

  if (isLoading) {
    return (
      <div className="shared-notebook-container loading-state">
        <div className="shared-loader-container">
          <div className="loader-wrapper">
            <SquaresLoader />
            <div className="loading-text">
              <h3>Loading shared notebook...</h3>
              <p>Please wait while we fetch the content</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-notebook-container error-state">
        <div className="shared-error-container">
          <div className="error-animation">
            <div className="error-icon">🔒</div>
            <div className="error-pulse"></div>
          </div>
          <div className="error-content">
            <h2>Oops! Notebook Not Found</h2>
            <p className="error-message">{error}</p>
            <p className="error-description">
              This notebook may have been removed, made private, or the link
              might be invalid.
            </p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`shared-notebook-container ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      {!isFullscreen && (
        <div className="shared-notebook-header">
          <div className="shared-notebook-info">
            <div className="shared-icon">
              <div className="icon-inner">
                <FaShare />
              </div>
              <div className="icon-badge">
                <FaEye />
              </div>
            </div>
            {/* <img src="../../assets/750003cb-fc39-41be-a28a-be393bf1013a.jpg" alt="" /> */}
            <div className="shared-title">
              {notebook.type == "image" ? (
                <h1>{notebook.title}</h1>
              ) : notebook.type == "pdf" ? (
                <h1>{notebook.title}</h1>
              ) : (
                <h1>{notebook.name}</h1>
              )}
              <div className="shared-meta">
                <div className="shared-by">
                  <FaUser />
                  <span>
                    Shared by <strong>{userId}</strong>
                  </span>
                </div>
                <div className="shared-date-info">
                  <FaClock />
                  <span>
                    Shared on{" "}
                    {formatDate(notebook.sharedAt || notebook.updatedAt)}
                  </span>
                </div>
                <div className="view-badge">
                  <FaEye />
                  <span>View Only</span>
                </div>
              </div>
            </div>
          </div>

          <div className="shared-actions">
            <button
              className="action-btn fullscreen-btn"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              <FaExpand />
            </button>
            <button
              className={`action-btn copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopyLink}
              title="Copy share link"
            >
              {copied ? (
                <>
                  <span className="checkmark">✓</span>
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="shared-canvas-container">
        {isFullscreen && (
          <button
            className="exit-fullscreen"
            onClick={toggleFullscreen}
            title="Exit fullscreen"
          >
            <FaCompress />
          </button>
        )}

        <div className="shared-grid-lines"></div>
        <div className="shared-canvas">{renderContent()}</div>

        <div className="canvas-stats">
          <span className="note-count">{getContentStats()}</span>
        </div>
      </div>

      {!isFullscreen && (
        <div className="shared-footer">
          <div className="footer-content">
            <div className="footer-left">
              <FaShare className="footer-icon" />
              <span>Shared notebook • View-only access</span>
            </div>
            <div className="footer-right">
              <span className="view-count">
                {notebook.viewCount
                  ? `${notebook.viewCount} views`
                  : "First view"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedNotebook;
