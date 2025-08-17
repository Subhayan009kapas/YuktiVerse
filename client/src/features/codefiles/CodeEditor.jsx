import React, { useState, useEffect, useRef } from "react";
import {
  FaSave,
  FaShare,
  FaCopy,
  FaTimes,
  FaFileCode,
  FaDownload,
  FaEdit,
  FaStar,
  FaRobot,
  FaSpinner,
  FaBug,
  FaLightbulb,
  FaMagic,
  FaCode,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaPlay,
} from "react-icons/fa";
import { toast } from "react-toastify";

import axios from "axios";

import SmartTextFormatter from "../../features/ai-notepad/AITextFormatter"; // your formatter

const frontenedURL = import.meta.env.VITE_FRONTENED_URL;
const backendURL = import.meta.env.VITE_BACKEND_URL;

let userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const LANGUAGE_CONFIG = {
  javascript: { label: "JavaScript", extension: "js", color: "#f7df1e" },
  python: { label: "Python", extension: "py", color: "#3776ab" },
  java: { label: "Java", extension: "java", color: "#ed8b00" },
  cpp: { label: "C++", extension: "cpp", color: "#00599c" },
  c: { label: "C", extension: "c", color: "#a8b9cc" },
  html: { label: "HTML", extension: "html", color: "#e34f26" },
  css: { label: "CSS", extension: "css", color: "#1572b6" },
  react: { label: "React/JSX", extension: "jsx", color: "#61dafb" },
  typescript: { label: "TypeScript", extension: "ts", color: "#3178c6" },
  php: { label: "PHP", extension: "php", color: "#777bb4" },
  ruby: { label: "Ruby", extension: "rb", color: "#cc342d" },
  go: { label: "Go", extension: "go", color: "#00add8" },
  rust: { label: "Rust", extension: "rs", color: "#000000" },
  kotlin: { label: "Kotlin", extension: "kt", color: "#7f52ff" },
  swift: { label: "Swift", extension: "swift", color: "#fa7343" },
  sql: { label: "SQL", extension: "sql", color: "#336791" },
  json: { label: "JSON", extension: "json", color: "#000000" },
  xml: { label: "XML", extension: "xml", color: "#0060ac" },
  markdown: { label: "Markdown", extension: "md", color: "#083fa1" },
  other: { label: "Other", extension: "txt", color: "#666666" },
};

const AI_ACTIONS = [
  {
    id: "debug",
    label: "Debug",
    icon: FaBug,
    description: "Find and fix bugs in your code",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: FaLightbulb,
    description: "Suggest performance improvements",
  },
  {
    id: "explain",
    label: "Explain",
    icon: FaCode,
    description: "Get detailed code explanation",
  },
  {
    id: "improve",
    label: "Improve",
    icon: FaMagic,
    description: "General code improvements and best practices",
  },
  {
    id: "generate",
    label: "Generate",
    icon: FaPlus,
    description: "Generate new code from description",
  },
];

// Helper function to extract and separate code blocks from response
const parseAiResponse = (response) => {
  if (!response) return { codeBlocks: [], explanation: response };

  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = response.match(codeBlockRegex) || [];
  const explanation = response
    .replace(codeBlockRegex, "[CODE_BLOCK_REMOVED]")
    .trim();

  // Clean up code blocks
  const cleanedCodeBlocks = codeBlocks.map((block) =>
    block
      .replace(/```[\w]*\n?/, "")
      .replace(/```$/, "")
      .trim()
  );

  return {
    codeBlocks: cleanedCodeBlocks,
    explanation: explanation.replace(/\[CODE_BLOCK_REMOVED\]/g, "").trim(),
  };
};
// Add this helper function with your other helper functions
const parseExecutionResult = (result) => {
  const lines = result.split("\n").filter((line) => line.trim());
  const parsed = {
    status: "UNKNOWN",
    output: "",
    executionTime: "",
    memoryUsage: "",
    rawResult: result,
  };

  lines.forEach((line) => {
    if (line.startsWith("Execution Status:")) {
      parsed.status = line.replace("Execution Status:", "").trim();
    } else if (line.startsWith("Output:")) {
      // Extract everything after "Output:" including code blocks
      const outputStart = result.indexOf("Output:") + "Output:".length;
      const executionTimeStart = result.indexOf("Execution Time:");
      const outputEnd =
        executionTimeStart > -1 ? executionTimeStart : result.length;
      parsed.output = result.substring(outputStart, outputEnd).trim();

      // Clean up code blocks
      parsed.output = parsed.output
        .replace(/```[\w]*\n?/g, "") // Remove opening code blocks
        .replace(/```$/g, "") // Remove closing code blocks
        .trim();
    } else if (line.startsWith("Execution Time:")) {
      parsed.executionTime = line.replace("Execution Time:", "").trim();
    } else if (line.startsWith("Memory Usage:")) {
      parsed.memoryUsage = line.replace("Memory Usage:", "").trim();
    }
  });

  return parsed;
};

// Helper function to get status icon and color
const getStatusDisplay = (status) => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes("success")) {
    return {
      icon: FaCheckCircle,
      color: "var(--color-success)",
      text: "SUCCESS",
    };
  } else if (
    normalizedStatus.includes("error") ||
    normalizedStatus.includes("failed")
  ) {
    return { icon: FaTimesCircle, color: "var(--color-error)", text: "ERROR" };
  } else {
    return {
      icon: FaExclamationCircle,
      color: "var(--color-warning)",
      text: "UNKNOWN",
    };
  }
};
const CodeEditor = ({
  codeFileId = null,
  initialData = null,
  onExit = () => {},
  onSave = () => {},
  onRename = () => {},
  onToggleImportant = () => {},
  onShare = () => {},
}) => {
  // State management
  const [codeFile, setCodeFile] = useState(
    initialData || {
      title: "Untitled Code File",
      content: "",
      language: "javascript",
      description: "",
      tags: [],
      important: false,
      isShared: false,
      viewCount: 0,
      version: 1,
      collaborators: [],
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // AI Assistant State
  const [currentAiResponse, setCurrentAiResponse] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [activeAiAction, setActiveAiAction] = useState(null);

  // Generate Code Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generateLanguage, setGenerateLanguage] = useState("javascript");

  // Refs
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const aiResponseRef = useRef(null);

  // run code
  // Add these new state variables with your existing ones
  const [showRunModal, setShowRunModal] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runHistory, setRunHistory] = useState([]);

  // escape to close modal
  // Add this useEffect for ESC key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showRunModal) {
        setShowRunModal(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showRunModal]);

  // Load code file data on mount if ID is provided
  useEffect(() => {
    if (codeFileId && !initialData) {
      fetchCodeFile();
    }
  }, [codeFileId]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [codeFile.content, codeFile.description, hasUnsavedChanges]);

  // Handle content changes
  useEffect(() => {
    if (
      initialData &&
      (initialData.content !== codeFile.content ||
        initialData.description !== codeFile.description ||
        initialData.title !== codeFile.title)
    ) {
      setHasUnsavedChanges(true);
    }
  }, [codeFile.content, codeFile.description, codeFile.title, initialData]);

  const fetchCodeFile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendURL}/api/codefiles/${codeFileId}`);
      const data = await response.json();
      setCodeFile(data);
    } catch (error) {
      console.error("Error fetching code file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // shared payload
      const payload = {
        title: codeFile.title,
        content: codeFile.content,
        description: codeFile.description,
        prog_language: codeFile.prog_language, // ✅ match schema
        tags: codeFile.tags,
        important: codeFile.important ?? false, // optional
        isShared: codeFile.isShared ?? false, // optional
      };

      let response;
      // console.log(codeFileId);

      if (codeFileId) {
        // Update existing file
        response = await axios.put(
          `${backendURL}/api/codefiles/${codeFileId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ match fetchCodeFiles
            },
          }
        );
      } else {
        // Create new file
        response = await axios.post(`${backendURL}/api/codefiles`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // console.log(response);

      const resp = response?.data;

      if (!response || response.status < 200 || response.status >= 300) {
        throw new Error(`Request failed with status ${response?.status}`);
      }
      if (resp && resp.success === false) {
        throw new Error(resp.message || "Failed to save code file");
      }

      // backend probably returns { success: true, data: { ...newFile } }
      const newFile = resp?.data ?? resp;

      // console.log(resp?.data);

      setCodeFile(newFile);
      onSave(newFile);

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving code file:", error);
      setFetchError && setFetchError(error.message || "Failed to save"); // optional consistency
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !codeFileId) return;

    try {
      await fetch(`${backendURL}/api/codefiles/${codeFileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: codeFile.title,
          content: codeFile.content,
          description: codeFile.description,
          prog_language: codeFile.prog_language,
        }),
      });
      setHasUnsavedChanges(false);
      // console.log('saved');
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  //run the code function
  const handleRunCode = async () => {
    if (!codeFile.content.trim() || isRunning) return;

    setIsRunning(true);
    setShowRunModal(true);
    setRunResult(null);

    // console.log(codeFile.content,codeFile.prog_language, codeFile.description );

    try {
      const response = await axios.post(
        `${backendURL}/api/codefiles/run`, // or your preferred endpoint
        {
          code: codeFile.content,
          language: codeFile.prog_language,
          question: codeFile.description || "Test the code execution",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.result || response.data;
      const parsedResult = parseExecutionResult(result);

      const newRunResult = {
        id: Date.now(),
        result: result,
        parsedResult: parsedResult, // Add this line
        language: codeFile.prog_language,
        timestamp: new Date().toISOString(),
        codeSnippet: codeFile.content.substring(0, 100) + "...",
      };

      setRunResult(newRunResult);
      setRunHistory((prev) => [newRunResult, ...prev.slice(0, 9)]); // Keep last 10 runs
    } catch (error) {
      console.error("Code execution failed:", error);
      const errorResult = {
        id: Date.now(),
        result: "EXECUTION ERROR - Unable to run code. Please try again.",
        language: codeFile.prog_language,
        timestamp: new Date().toISOString(),
        codeSnippet: codeFile.content.substring(0, 100) + "...",
        error: true,
      };
      setRunResult(errorResult);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiAssist = async (actionType) => {
    if (actionType === "generate") {
      setShowGenerateModal(true);
      return;
    }

    if (!codeFile.content || isAiThinking) return;

    setIsAiThinking(true);
    setActiveAiAction(actionType);
    setCurrentAiResponse(null);

    try {
      let endpoint = "";
      let requestBody = {};

      switch (actionType) {
        case "debug":
          endpoint = `${backendURL}/api/ai-help/correction`;
          requestBody = {
            code: codeFile.content,
            language: codeFile.prog_language,
            error: "",
            description: codeFile.description,
          };
          break;

        case "optimize":
          endpoint = `${backendURL}/api/ai-help/optimize`;
          requestBody = {
            code: codeFile.content,
            language: codeFile.prog_language,
            description: codeFile.description,
          };
          break;

        case "explain":
          endpoint = `${backendURL}/api/ai-help/explain`;
          requestBody = {
            code: codeFile.content,
            language: codeFile.prog_language,
            description: codeFile.description,
          };
          break;

        case "improve":
          endpoint = `${backendURL}/api/ai-help/improve`;
          requestBody = {
            code: codeFile.content,
            language: codeFile.prog_language,
            // action: 'improve',
            description: codeFile.description,
          };
          break;

        default:
          endpoint = `${backendURL}/api/ai-help/generation`;
          requestBody = {
            code: codeFile.content,
            language: codeFile.prog_language,
            action: actionType,
            description: codeFile.description,
          };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const rawResponse =
        data.data?.response ||
        data.response ||
        data.message ||
        "No response received";

      // Parse the response to separate code and explanation
      const parsedResponse = parseAiResponse(rawResponse);
      // console.log(parsedResponse);

      const newResponse = {
        id: Date.now(),
        action: actionType,
        query: `${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } assistance`,
        rawResponse: rawResponse,
        codeBlocks: parsedResponse.codeBlocks,
        explanation: parsedResponse.explanation,
        timestamp: new Date().toISOString(),
        codeSnippet: codeFile.content.substring(0, 100) + "...",
      };

      setCurrentAiResponse(newResponse);
      setAiHistory((prev) => [newResponse, ...prev.slice(0, 9)]); // Keep last 10 responses

      // For debug, optimize, and explain actions, update the description with explanation
      if (
        ["debug", "optimize", "explain"].includes(actionType) &&
        parsedResponse.explanation
      ) {
        setCodeFile((prev) => ({
          ...prev,
          description: parsedResponse.explanation,
        }));
        setHasUnsavedChanges(true);
      }

      // Scroll to AI response
      if (aiResponseRef.current) {
        aiResponseRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("AI assistance failed:", error);
      const errorResponse = {
        id: Date.now(),
        action: actionType,
        query: `${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } assistance`,
        rawResponse:
          "Sorry, AI assistance is currently unavailable. Please try again later.",
        codeBlocks: [],
        explanation:
          "Sorry, AI assistance is currently unavailable. Please try again later.",
        timestamp: new Date().toISOString(),
        codeSnippet: codeFile.content.substring(0, 100) + "...",
      };
      setCurrentAiResponse(errorResponse);
    } finally {
      setIsAiThinking(false);
      setActiveAiAction(null);
    }
  };

  const handleGenerateCode = async () => {
    if (!generatePrompt.trim() || isAiThinking) return;

    setIsAiThinking(true);
    setActiveAiAction("generate");
    setCurrentAiResponse(null);
    setShowGenerateModal(false);

    try {
      const response = await fetch(`${backendURL}/api/ai-help/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: generatePrompt,
          language: generateLanguage,
          action: "generate",
          description: generatePrompt,
        }),
      });
      console.log(response);

      const data = await response.json();
      const rawResponse =
        data.data?.response ||
        data.response ||
        data.message ||
        "No response received";

      // Parse the response to separate code and explanation
      const parsedResponse = parseAiResponse(rawResponse);

      const newResponse = {
        id: Date.now(),
        action: "generate",
        query: generatePrompt,
        rawResponse: rawResponse,
        codeBlocks: parsedResponse.codeBlocks,
        explanation: parsedResponse.explanation,
        timestamp: new Date().toISOString(),
        codeSnippet: generatePrompt.substring(0, 100) + "...",
      };

      setCurrentAiResponse(newResponse);
      setAiHistory((prev) => [newResponse, ...prev.slice(0, 9)]); // Keep last 10 responses

      // Update the code editor with generated code and description with explanation
      if (parsedResponse.codeBlocks && parsedResponse.codeBlocks.length > 0) {
        setCodeFile((prev) => ({
          ...prev,
          content: parsedResponse.codeBlocks[0], // Use first code block
          language: generateLanguage,
          description: parsedResponse.explanation || generatePrompt,
        }));
        setHasUnsavedChanges(true);
      }

      // Reset generate form
      setGeneratePrompt("");
      setGenerateLanguage("javascript");

      // Scroll to AI response
      if (aiResponseRef.current) {
        aiResponseRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Code generation failed:", error);
      const errorResponse = {
        id: Date.now(),
        action: "generate",
        query: generatePrompt,
        rawResponse:
          "Sorry, code generation is currently unavailable. Please try again later.",
        codeBlocks: [],
        explanation:
          "Sorry, code generation is currently unavailable. Please try again later.",
        timestamp: new Date().toISOString(),
        codeSnippet: generatePrompt.substring(0, 100) + "...",
      };
      setCurrentAiResponse(errorResponse);
    } finally {
      setIsAiThinking(false);
      setActiveAiAction(null);
    }
  };

  const handleRename = async () => {
    if (!codeFile.title || !codeFileId) return;

    try {
      await fetch(`${backendURL}/api/codefiles/${codeFileId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: codeFile.title }),
      });
      setIsRenaming(false);
      onRename(codeFile.title);
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleToggleImportant = async () => {
    try {
      await fetch(`${backendURL}/api/codefiles/${codeFileId}/important`, {
        method: "PATCH",
      });
      const updated = { ...codeFile, important: !codeFile.important };
      setCodeFile(updated);
      onToggleImportant(updated.important);
    } catch (error) {
      console.error("Error toggling important:", error);
    }
  };

  const handleShare = async () => {
    if (!codeFileId) return;

    try {
      setIsSharing(true);
      const response = await fetch(
        `${backendURL}/api/codefiles/${codeFileId}/share`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      setShareUrl(data.shareUrl);
      const updated = { ...codeFile, isShared: true };
      setCodeFile(updated);
      onShare(data.shareUrl);
    } catch (error) {
      console.error("Error sharing code file:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    const langConfig =
      LANGUAGE_CONFIG[codeFile.prog_language] || LANGUAGE_CONFIG.other;
    const filename = `${codeFile.title}.${langConfig.extension}`;
    const blob = new Blob([codeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!codeFile.tags.includes(newTag)) {
        const updated = { ...codeFile, tags: [...codeFile.tags, newTag] };
        setCodeFile(updated);
        setHasUnsavedChanges(true);
      }
      e.target.value = "";
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = {
      ...codeFile,
      tags: codeFile.tags.filter((tag) => tag !== tagToRemove),
    };
    setCodeFile(updated);
    setHasUnsavedChanges(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageColor = () => {
    return LANGUAGE_CONFIG[codeFile.prog_language]?.color || "#666666";
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "1.125rem",
          color: "var(--text-primary)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        <FaSpinner
          style={{
            animation: "spin 1s linear infinite",
            marginRight: "0.5rem",
          }}
        />
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // marginLeft: '80px',
        border: "1px solid var(--color-border-primary)",
        borderRadius: "0.5rem",
        overflow: "hidden",
        backgroundColor: "var(--card-bg)",
        height: "100vh",
        maxHeight: "900px",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--header-bg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginLeft: "2rem",
          }}
        >
          {isRenaming ? (
            <input
              type="text"
              value={codeFile.title}
              onChange={(e) =>
                setCodeFile({ ...codeFile, title: e.target.value })
              }
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              style={{
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "0.25rem",
                padding: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: "bold",
                backgroundColor: "var(--color-surface)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsRenaming(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              <FaFileCode style={{ color: getLanguageColor() }} />
              <h2
                style={{ fontSize: "1.125rem", fontWeight: "bold", margin: 0 }}
              >
                {codeFile.title}
              </h2>
              <FaEdit style={{ fontSize: "0.875rem", opacity: 0.6 }} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",

                textShadow: "0px 0px 5px black",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "white",
                backgroundColor: getLanguageColor(),
              }}
            >
              {LANGUAGE_CONFIG[codeFile.prog_language]?.label ||
                codeFile.prog_language}
            </span>

            {codeFile.important && (
              <FaStar style={{ color: "var(--color-accent-highlight)" }} />
            )}

            {hasUnsavedChanges && (
              <span
                style={{
                  color: "var(--color-accent-highlight)",
                  fontSize: "1.125rem",
                }}
              >
                •
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={handleToggleImportant}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              backgroundColor: codeFile.important
                ? "var(--color-accent-highlight)"
                : "var(--color-surface)",
              color: codeFile.important
                ? "var(--text-dark)"
                : "var(--text-primary)",
            }}
            title="Toggle Important"
          >
            <FaStar />
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
              backgroundColor: "var(--color-surface)",
              color: "var(--text-primary)",
            }}
            title="Download File"
          >
            <FaDownload />
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing || codeFile.isShared}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor:
                isSharing || codeFile.isShared ? "not-allowed" : "pointer",
              backgroundColor: codeFile.isShared
                ? "var(--color-accent-info)"
                : "var(--color-surface)",
              color: codeFile.isShared ? "white" : "var(--text-primary)",
              opacity: isSharing ? 0.7 : 1,
            }}
          >
            <FaShare />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor:
                isSaving || !hasUnsavedChanges ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor:
                isSaving || !hasUnsavedChanges
                  ? "var(--color-surface)"
                  : "var(--accent-primary)",
              color:
                isSaving || !hasUnsavedChanges
                  ? "var(--text-secondary)"
                  : "var(--text-dark)",
              fontSize: "0.875rem",
            }}
          >
            <FaSave />
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={onExit}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
              backgroundColor: "var(--color-error)",
              color: "white",
            }}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Language Selector & Tags */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          padding: ".4rem",
          borderBottom: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontWeight: "600" }}>Tags:</label>
          {codeFile.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: "var(--accent-primary)",
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--text-dark)",
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{
                  color: "var(--text-dark)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "1rem",
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            style={{
              border: "1px solid var(--color-border-secondary)",
              borderRadius: "0.25rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              width: "8rem",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          onClick={handleRunCode}
          disabled={!codeFile.content.trim() || isRunning}
          style={{
            background: isRunning
              ? "var(--success)"
              : "var(--color-accent-info)",
            color: isRunning ? "var(--text-secondary)" : "white",
            padding: "0.5rem 1rem",
            border: "none",
            marginRight: "1rem",
            borderRadius: "0.25rem",
            cursor:
              isRunning || !codeFile.content.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "bold",
            opacity: isRunning || !codeFile.content.trim() ? 0.6 : 1,
          }}
        >
          {isRunning ? (
            <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <FaPlay />
          )}
          {isRunning ? "Running..." : "RUN"}
        </button>
        {/* Run Code Modal */}
        {showRunModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "var(--color-overlay)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRunModal(false);
              }
            }}
          >
            <div
              style={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border-primary)",
                padding: "1.5rem",
                minWidth: "600px",
                maxWidth: "70vw",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    margin: 0,
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaPlay style={{ color: "var(--accent-info)" }} />
                  Code Execution Result
                </h3>
                <button
                  onClick={() => setShowRunModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    padding: "0.25rem",
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              {/* Enhanced Content */}
              {isRunning ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "2rem",
                    color: "var(--accent-info)",
                  }}
                >
                  <FaSpinner
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "2rem",
                    }}
                  />
                  <span>Executing your {codeFile.prog_language} code...</span>
                </div>
              ) : runResult ? (
                <div>
                  {/* Execution Summary */}
                  <div
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderRadius: "0.5rem",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                      border: "1px solid var(--color-border-secondary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "white",
                            backgroundColor:
                              LANGUAGE_CONFIG[runResult.language]?.color ||
                              "#666666",
                          }}
                        >
                          {LANGUAGE_CONFIG[runResult.language]?.label ||
                            runResult.language}
                        </span>

                        {runResult.parsedResult &&
                          (() => {
                            const statusDisplay = getStatusDisplay(
                              runResult.parsedResult.status
                            );
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "9999px",
                                  backgroundColor: `${statusDisplay.color}20`,
                                  color: statusDisplay.color,
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  border: `1px solid ${statusDisplay.color}40`,
                                }}
                              >
                                <statusDisplay.icon />
                                {statusDisplay.text}
                              </div>
                            );
                          })()}
                      </div>

                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(runResult.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    {runResult.parsedResult &&
                      (runResult.parsedResult.executionTime ||
                        runResult.parsedResult.memoryUsage) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "2rem",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {runResult.parsedResult.executionTime && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                ⏱️ Time:
                              </span>
                              <span>
                                {runResult.parsedResult.executionTime}
                              </span>
                            </div>
                          )}
                          {runResult.parsedResult.memoryUsage && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                💾 Memory:
                              </span>
                              <span>{runResult.parsedResult.memoryUsage}</span>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Output Section */}
                  <div
                    style={{
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                        paddingBottom: "0.5rem",
                        borderBottom: "1px solid var(--color-border-secondary)",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        📋 Output
                      </h4>
                      <button
                        onClick={() => {
                          const outputText =
                            runResult.parsedResult?.output || runResult.result;
                          navigator.clipboard.writeText(outputText);
                          toast.success("Output copied!");
                        }}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid var(--color-border-secondary)",
                          backgroundColor: "var(--card-bg)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>

                    <div
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--color-border-secondary)",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                        maxHeight: "300px",
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {runResult.error ? (
                        <div style={{ color: "var(--color-error)" }}>
                          {runResult.result}
                        </div>
                      ) : (
                        <div style={{ color: "var(--text-primary)" }}>
                          {runResult.parsedResult?.output || runResult.result}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => handleRunCode()}
                      disabled={isRunning}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        border: "1px solid var(--accent-info)",
                        background: isRunning
                          ? "var(--success)"
                          : "var(--color-accent-info)",
                        color: "var(--accent-info)",
                        cursor: isRunning ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <FaPlay /> Run Again
                    </button>
                    <button
                      onClick={() => setShowRunModal(false)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        border: "none",
                        backgroundColor: "var(--danger)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <FaExclamationCircle
                    style={{ fontSize: "2rem", marginBottom: "1rem" }}
                  />
                  <p>No execution result available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main 3-Section Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Section - Code Editor */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--color-border-primary)",
              backgroundColor: "var(--color-surface)",
              fontWeight: "bold",
              background: "var(--color-background)",
            }}
          >
            <span>Code Editor</span>
            <div
              style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
            >
              Lines: {codeFile.content.split("\n").length} | Size:{" "}
              {new Blob([codeFile.content]).size} bytes
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={codeFile.content}
            onChange={(e) => {
              setCodeFile({ ...codeFile, content: e.target.value });
              setHasUnsavedChanges(true);
            }}
            style={{
              flex: 1,
              padding: "1rem",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: "0.9rem",
              lineHeight: "1.5",
              resize: "none",
              outline: "none",
              border: "none",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
              caretColor: "var(--accent-primary)",
            }}
            placeholder="Start writing your code here..."
          />
        </div>

        {/* middle Section - AI Response */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--card-bg)",
            minWidth: "300px",
            borderLeft: "2px solid var(--border-divider)",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--color-border-primary)",
              backgroundColor: "var(--color-surface)",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",

              background: "var(--color-background)",
            }}
          >
            <FaRobot style={{ color: "var(--accent-primary)" }} />
            <span>AI Response</span>
          </div>

          <div
            ref={aiResponseRef}
            style={{
              flex: 1,
              overflow: "auto",
              padding: "1rem",
            }}
          >
            {currentAiResponse ? (
              <div>
                {/* Action Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border-secondary)",
                  }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: "var(--accent-primary)",
                    }}
                  >
                    {currentAiResponse.action.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {new Date(currentAiResponse.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Code Blocks */}
                {currentAiResponse.codeBlocks &&
                  currentAiResponse.codeBlocks.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {currentAiResponse.codeBlocks.map((codeBlock, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "1rem",
                            border: "1px solid var(--color-border-secondary)",
                            borderRadius: "0.5rem",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.5rem 1rem",
                              backgroundColor: "var(--color-surface)",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                            }}
                          >
                            <span>Code Block {index + 1}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeBlock);
                                toast.success("Copied");
                              }}
                              style={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                                border:
                                  "1px solid var(--color-border-secondary)",
                                cursor: "pointer",
                                backgroundColor: "var(--card-bg)",
                                color: "var(--text-primary)",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaCopy /> Copy
                            </button>
                          </div>
                          <pre
                            style={{
                              padding: "1rem",
                              margin: 0,
                              backgroundColor: "var(--card-bg)",
                              color: "var(--text-primary)",
                              fontSize: "0.85rem",
                              lineHeight: "1.4",
                              fontFamily:
                                "'Fira Code', 'Courier New', monospace",
                              overflow: "auto",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {codeBlock}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <FaRobot
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                    opacity: 0.2,
                  }}
                />
                <h3 style={{ margin: "0 0 0.5rem 0", fontWeight: "normal" }}>
                  No AI Response Yet
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.4" }}>
                  AI responses will appear here after using the assistant
                  buttons.
                </p>
              </div>
            )}

            
          </div>
        </div>

        {/* right Section - AI Assistant Buttons */}
        <div
          style={{
            width: "200px",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid var(--color-border-primary)",
            borderRight: "1px solid var(--color-border-primary)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--color-border-primary)",
              backgroundColor: "var(--header-bg)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <FaRobot style={{ color: "var(--accent-primary)" }} />
              <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                AI Assistant
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr", // 2 buttons per row
                gap: "1rem",
              }}
            >
              {AI_ACTIONS.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleAiAssist(action.id)}
                  disabled={
                    action.id !== "generate" &&
                    (!codeFile.content || isAiThinking)
                  }
                  style={{
                    padding: "1rem 0.5rem",
                    borderRadius: "0.5rem",
                    border: `2px solid ${
                      activeAiAction === action.id
                        ? "var(--accent-primary)"
                        : "var(--color-border-secondary)"
                    }`,
                    cursor:
                      action.id !== "generate" &&
                      (!codeFile.content || isAiThinking)
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor:
                      activeAiAction === action.id
                        ? "rgba(104, 211, 145, 0.1)"
                        : "var(--card-bg)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    opacity:
                      action.id !== "generate" &&
                      (!codeFile.content || isAiThinking)
                        ? 0.5
                        : 1,
                    transition: "all 0.2s ease",
                    gridColumn:
                      index === AI_ACTIONS.length - 1 ? "span 2" : "auto", // 👈 full width for last button
                  }}
                  title={action.description}
                >
                  {isAiThinking && activeAiAction === action.id ? (
                    <FaSpinner
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <action.icon style={{ fontSize: "1.2rem" }} />
                  )}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div
            style={{
              padding: "1rem",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {isAiThinking ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  color: "var(--accent-primary)",
                }}
              >
                <FaSpinner
                  style={{
                    animation: "spin 1s linear infinite",
                    fontSize: "2rem",
                  }}
                />
                <span style={{ fontSize: "0.9rem" }}>
                  AI is analyzing your code...
                </span>
              </div>
            ) : currentAiResponse ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--accent-primary)",
                }}
              >
                <FaRobot style={{ fontSize: "2rem" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                  Response Ready!
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Check the right panel
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  color: "var(--text-secondary)",
                }}
              >
                <FaRobot style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontWeight: "normal",
                      fontSize: "0.9rem",
                    }}
                  >
                    AI Ready
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      lineHeight: "1.3",
                    }}
                  >
                    Use the buttons above for AI assistance or generate new code
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Split Description & History */}
      <div
        style={{
          borderTop: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          height: "200px",
        }}
      >
        {/* Left Half - Description & Notes */}

        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--color-border-primary)",
              fontWeight: "bold",
              backgroundColor: "var(--header-bg)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              position: "sticky",
              top: "0px",
            }}
          >
            Description & Notes
          </div>
          {isEditing ? (
            <textarea
              value={codeFile.description || ""}
              onChange={(e) => {
                setCodeFile({ ...codeFile, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              onBlur={() => setIsEditing(false)}
              autoFocus
              style={{
                flex: 1,
                padding: "1rem",
                resize: "none",
                outline: "none",
                border: "none",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: ".8rem", // 👈 font size for editing
                lineHeight: "1.5",
                fontFamily: "inherit",
              }}
              placeholder="Add a description, notes, or documentation for your code..."
            />
          ) : (
            <div
              style={{
                flex: 1,
                padding: "1rem",
                cursor: "text",
                minHeight: "100px",
                backgroundColor: "var(--card-bg)",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                fontSize: ".8rem", // 👈 font size for viewing
                lineHeight: "1.5",
              }}
              onClick={() => setIsEditing(true)}
            >
              {codeFile.description ? (
                <SmartTextFormatter text={codeFile.description} />
              ) : (
                <span style={{ color: "var(--text-secondary)" }}>
                  Add a description, notes, or documentation for your code...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Half - AI Response History */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid var(--color-border-primary)",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--color-border-primary)",
              fontWeight: "bold",
              backgroundColor: "var(--header-bg)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaHistory />
            Response History
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "0.5rem",
            }}
          >
            {aiHistory.length > 0 ? (
              <div>
                {aiHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAiResponse(item)}
                    style={{
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                      borderRadius: "0.5rem",
                      backgroundColor:
                        currentAiResponse?.id === item.id
                          ? "var(--feature-card-bg)"
                          : "var(--card-bg)",
                      border: `1px solid ${
                        currentAiResponse?.id === item.id
                          ? "var(--accent-primary)"
                          : "var(--color-border-secondary)"
                      }`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "var(--accent-primary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.action}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        lineHeight: "1.4",
                        color: "var(--text-primary)",
                        maxHeight: "60px",
                        overflow: "hidden",
                      }}
                    >
                      {item.explanation && item.explanation.length > 0
                        ? item.explanation.substring(0, 120) +
                          (item.explanation.length > 120 ? "..." : "")
                        : item.rawResponse.substring(0, 120) +
                          (item.rawResponse.length > 120 ? "..." : "")}
                    </div>

                    {item.codeBlocks && item.codeBlocks.length > 0 && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--accent-primary)",
                          marginTop: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        📝 {item.codeBlocks.length} code block
                        {item.codeBlocks.length > 1 ? "s" : ""} included
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <FaHistory
                  style={{
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                    opacity: 0.3,
                  }}
                />
                <p style={{ margin: 0, fontSize: "0.8rem" }}>
                  AI response history will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderTop: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--header-bg)",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>Last modified: {formatDate(codeFile.lastModified)}</span>
          {codeFile.isShared && (
            <span style={{ color: "var(--accent-primary)" }}>
              Shared • Views: {codeFile.viewCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isSaving && (
            <span style={{ color: "var(--accent-primary)" }}>
              <FaSpinner
                style={{
                  animation: "spin 1s linear infinite",
                  marginRight: "0.25rem",
                }}
              />
              Saving...
            </span>
          )}
          {hasUnsavedChanges && !isSaving && (
            <span style={{ color: "var(--color-accent-highlight)" }}>
              Unsaved changes
            </span>
          )}
          <span>Version: {codeFile.version}</span>
        </div>
      </div>

      {/* Generate Code Modal */}
      {showGenerateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "var(--color-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border-primary)",
              padding: "2rem",
              minWidth: "500px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaPlus style={{ color: "var(--accent-primary)" }} />
              Generate New Code
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "var(--text-primary)",
                }}
              >
                Programming Language:
              </label>
              <select
                value={generateLanguage}
                onChange={(e) => setGenerateLanguage(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.25rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                {Object.entries(LANGUAGE_CONFIG)
                  .filter(([key]) => key !== "other")
                  .map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "var(--text-primary)",
                }}
              >
                Describe what you want to generate:
              </label>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="Example: Create a function that sorts an array of numbers in ascending order..."
                style={{
                  width: "100%",
                  height: "120px",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.25rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratePrompt("");
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCode}
                disabled={!generatePrompt.trim() || isAiThinking}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  cursor:
                    !generatePrompt.trim() || isAiThinking
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor:
                    !generatePrompt.trim() || isAiThinking
                      ? "var(--color-surface)"
                      : "var(--accent-primary)",
                  color:
                    !generatePrompt.trim() || isAiThinking
                      ? "var(--text-secondary)"
                      : "var(--text-dark)",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  opacity: !generatePrompt.trim() || isAiThinking ? 0.6 : 1,
                }}
              >
                {isAiThinking ? (
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <FaMagic />
                )}
                {isAiThinking ? "Generating..." : "Generate Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "var(--color-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border-primary)",
              padding: "2rem",
              minWidth: "450px",
              maxWidth: "90vw",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaShare style={{ color: "var(--accent-primary)" }} />
              Share Code File
            </h3>

            <p
              style={{
                margin: "0 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Your code file is now publicly accessible via this link:
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.25rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--text-dark)",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                <FaCopy /> Copy
              </button>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShareUrl("")}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Scrollbar Styling */
        *::-webkit-scrollbar {
          width: 8px;
        }

        *::-webkit-scrollbar-track {
          background: var(--color-surface);
        }

        *::-webkit-scrollbar-thumb {
          background: var(--accent-primary);
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: var(--secondary-accent);
        }

        /* Button hover effects */
        button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        /* Input focus effects */
        input:focus,
        textarea:focus,
        select:focus {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }

        /* Selection styling */
        ::selection {
          background-color: var(--accent-primary);
          color: var(--text-dark);
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease,
            color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;