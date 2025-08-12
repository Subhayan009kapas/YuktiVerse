// Popover.jsx - Simplified without authentication
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import AiHelpers from "./AiHelpers";
import "./Popover.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";
import { DotsLoader } from "../../components/Loader";

const Popover = ({
  anchorRef,
  onClose,
  children,
  text,
  textBoxId,
  notebookId,
}) => {
  const popoverRef = useRef();

  const [shortResponse, setShortResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchShortResponse = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log("Making request with:", {
        prompt: text,
        textBoxId,
        notebookId,
        forceRefresh,
      });

      const response = await axios.post(
        `${backendURL}/api/ai-help/short-explain`,
        {
          prompt: text,
          textBoxId,
          notebookId,
          forceRefresh, // Flag to bypass cache and get fresh response
        }
      );

      console.log("AI short response:", response.data);

      // The response now includes fromCache info
      setShortResponse({
        response: response.data.response,
        fromCache: response.data.fromCache || false,
        task: response.data.task,
        cached: response.data.cached,
      });
    } catch (error) {
      console.error("Short response error:", error);

      let errorMessage = "Something went wrong. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 404) {
        errorMessage = "Notebook or textbox not found.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setShortResponse({
        response: errorMessage,
        fromCache: false,
        task: "short-explain",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (text && textBoxId && notebookId) {
      fetchShortResponse();
    } else if (text) {
      // Fallback for cases where textBoxId/notebookId are not provided
      console.log(
        "Fallback: no textBoxId/notebookId provided, using basic mode"
      );
      fetchShortResponse();
    }
  }, [text, textBoxId, notebookId]);

  const [copilotOpen, setCopilotOpen] = useState(false);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  // Compute position relative to the page
  const getPosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return { top: 0, left: 0 };
    return {
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    };
  };
  const position = getPosition();

  // Handle improve button click - force refresh
  const handleImprove = () => {
    fetchShortResponse(true); // Pass true to force refresh
  };

  // Render into the body
  return ReactDOM.createPortal(
    <div
      className="custom-popover"
      ref={popoverRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 2147483647,
        color: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "6px",
        padding: "12px",
        minWidth: "200px",
      }}
    >
      <div className="ai-popover">
        <div className="ai-popover-content">
          <div className="ai-summary">
            {loading ? (
              <DotsLoader />
            ) : (
              <p
                style={{ color: shortResponse?.error ? "#ff6b6b" : "inherit" }}
              >
                {shortResponse?.response ===
                "Error fetching response from Gemini."
                  ? "Something went wrong. Please try again."
                  : shortResponse?.response}
              </p>
            )}
          </div>
          {/* Cache indicator */}
          {shortResponse?.fromCache && !loading && (
            <div
              className="cache-indicator"
              style={{
                fontSize: "11px",
                opacity: 0.7,
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#4ade80",
              }}
            >
              <span>
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
                  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                  <path d="M9 12l2 2l4 -4" />
                </svg>
              </span>
              <span>Response saved</span>
            </div>
          )}
          {/* Show if response was cached to database */}
          {shortResponse?.cached && !shortResponse?.fromCache && !loading && (
            <div
              className="cache-indicator"
              style={{
                fontSize: "11px",
                opacity: 0.7,
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#60a5fa",
              }}
            >
              <span>💿</span>
              <span>Response saved</span>
            </div>
          )}
        </div>
        <div className="ai-popover-footer">
          <div className="ai-powered">Powered by AI</div>
          <div className="ai-actions">
            <button
              className="ai-action-btn secondary"
              onClick={handleImprove}
              disabled={loading || shortResponse?.error}
            >
              {loading ? "Loading..." : "Improve"}
            </button>

            <button
              className="ai-action-btn primary"
              onClick={() => setCopilotOpen(true)}
              disabled={shortResponse?.error}
            >
              Ask Assistant
            </button>
          </div>
        </div>
      </div>
      {copilotOpen && (
        <AiHelpers
          text={text}
          onClose={() => setCopilotOpen(false)}
          mode="notepad"
        />
      )}
    </div>,
    document.body
  );
};

export default Popover;
