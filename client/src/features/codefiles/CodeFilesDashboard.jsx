import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaStar,
  FaRegStar,
  FaCode,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaCalendarAlt,
  FaEye,
  FaShare,
  FaTimes,
  FaFileCode,
  FaSpinner,
  FaRobot,
  FaLightbulb,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";
import CodeEditor from "./CodeEditor"; // Assuming the CodeEditor component is in the same directory
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import { Link } from "react-router-dom";
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

const CodeFilesDashboard = () => {
  // State management
  const [codeFiles, setCodeFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastModified"); // lastModified, title, createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [filterBy, setFilterBy] = useState("all"); // all, important, shared, language
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("all");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // New file modal state
  const [newFileTitle, setNewFileTitle] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [newFileDescription, setNewFileDescription] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load code files on component mount
  useEffect(() => {
    fetchCodeFiles();
  }, []);

  // Filter and sort files whenever dependencies change
  useEffect(() => {
    filterAndSortFiles();
  }, [
    codeFiles,
    searchQuery,
    sortBy,
    sortOrder,
    filterBy,
    selectedLanguageFilter,
  ]);

  const fetchCodeFiles = async (params = {}) => {
    try {
      setIsLoading(true);
      setFetchError && setFetchError(null); // optional fetchError state

      const response = await axios.get(`${backendURL}/api/codefiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params, // optional: { page: 1, limit: 10, search: 'foo' }
      });

      // axios puts the parsed body on response.data
      // Your backend probably returns: { success: true, data: { codeFiles, pagination } }
      const resp = response?.data;

      if (!response || response.status < 200 || response.status >= 300) {
        throw new Error(`Request failed with status ${response?.status}`);
      }

      if (resp && resp.success === false) {
        throw new Error(resp.message || "Failed to fetch code files");
      }

      // Try to extract an array of files from common response shapes:
      const files =
        resp?.data?.codeFiles ?? // { data: { codeFiles: [...] } }
        resp?.data ?? // { data: [...] } or single object
        resp; // fallback raw body (maybe an array)

      setCodeFiles(Array.isArray(files) ? files : []);
    } catch (error) {
      console.error("Error fetching code files:", error);
      setCodeFiles([]); // fallback to empty list
      setFetchError && setFetchError(error.message || "Failed to fetch"); // optional
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortFiles = () => {
    // let filtered = [...codeFiles];
    let filtered = Array.isArray(codeFiles) ? [...codeFiles] : [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.title.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query) ||
          file.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    switch (filterBy) {
      case "important":
        filtered = filtered.filter((file) => file.important);
        break;
      case "shared":
        filtered = filtered.filter((file) => file.isShared);
        break;
      case "language":
        if (selectedLanguageFilter !== "all") {
          filtered = filtered.filter(
            (file) => file.language === selectedLanguageFilter
          );
        }
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "lastModified":
        default:
          aValue = new Date(a.lastModified);
          bValue = new Date(b.lastModified);
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredFiles(filtered);
  };

  const handleCreateNewFile = async () => {
    if (!newFileTitle.trim()) return;

    try {
      const response = await fetch(`${backendURL}/api/codefiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newFileTitle,
          prog_language: newFileLanguage, // matches backend field
          description: newFileDescription,
          content: "",
          tags: [], // you can pass tags if needed
          important: false,
          isShared: false,
        }),
      });

      const respJson = await response.json();

      if (!response.ok) {
        // Backend sends { success: false, message, ... }
        throw new Error(respJson?.message || "Failed to create file");
      }

      // backend returns the created file in respJson.data
      const createdFile = respJson?.data;
      if (!createdFile) {
        throw new Error("Server did not return created file");
      }

      // Safely update codeFiles state (ensure prev is an array)
      setCodeFiles((prev) => {
        const previousFiles = Array.isArray(prev) ? prev : [];
        return [createdFile, ...previousFiles];
      });

      setSelectedFile(createdFile);

      // Reset modal / form state
      setShowNewFileModal(false);
      setNewFileTitle("");
      setNewFileLanguage("javascript");
      setNewFileDescription("");
    } catch (error) {
      console.error("Error creating new file:", error);
      alert(`Error creating file: ${error.message}`);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileRename = async (fileId, newTitle) => {
    console.log("asche");

    if (!newTitle.trim()) return;

    try {
      await fetch(`${backendURL}/api/codefiles/${fileId}/rename`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      setCodeFiles((prev) =>
        prev.map((file) =>
          file._id === fileId ? { ...file, title: newTitle } : file
        )
      );

      if (selectedFile && selectedFile._id === fileId) {
        setSelectedFile((prev) => ({ ...prev, title: newTitle }));
      }

      setEditingFileId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleToggleImportant = async (fileId) => {
    try {
      const res = await fetch(
        `${backendURL}/api/codefiles/${fileId}/important`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const resp = await res.json();

      if (!res.ok || resp.success === false) {
        throw new Error(
          resp.message || `Request failed with status ${res.status}`
        );
      }

      const { important } = resp.data;

      // ✅ Update list
      setCodeFiles((prev) =>
        prev.map((file) =>
          file._id === fileId ? { ...file, important } : file
        )
      );

      // ✅ Update selected file if it’s the one toggled
      if (selectedFile && selectedFile._id === fileId) {
        setSelectedFile((prev) => ({ ...prev, important }));
      }
    } catch (error) {
      console.error("Error toggling important:", error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    // console.log(fileId);

    try {
      await fetch(`${backendURL}/api/codefiles/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCodeFiles((prev) => prev.filter((file) => file._id !== fileId));

      if (selectedFile && selectedFile._id === fileId) {
        setSelectedFile(null);
      }

      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleFileUpdate = (updatedFile) => {
    setCodeFiles((prev) =>
      prev.map((file) => (file._id === updatedFile._id ? updatedFile : file))
    );
    setSelectedFile(updatedFile);
    console.log(updatedFile);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageColor = (language) => {
    return LANGUAGE_CONFIG[language]?.color || "#666666";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "var(--background-primary)",
        color: "var(--text-primary)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        position: "relative", // <-- add this
      }}
    >
      {/* Header bar — sits to the right of the sidebar and centers the title */}
      <div
        style={{
          // visibility : sidebarOpen ? '': 'hidden',
          position: "fixed",
          top: 0,
          left: sidebarOpen ? "400px" : "80px", // shift start to the right of the sidebar
          right: 0, // stretch to the right edge
          height: "3rem",
          display: "flex",
          alignItems: "center", // vertical center
          justifyContent: "center", // horizontal center
          color: "var(--text-primary)",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          zIndex: 1000,
          pointerEvents: "none",
          // background :'var(--header-bg)'
          // header won't block clicks underneath; remove if you want it clickable
        }}
      >
        <h2
          style={{
            margin: 0,
            pointerEvents: "auto" /* allow clicks on the text if needed */,
            gap: ".4rem",
            display: "flex",
          }}
        >
          <span
            style={{
              color: "var(--accent-primary)",
            }}
          >
            <FaCode />
          </span>
          Code Verse
        </h2>
      </div>

      {/* Sidebar */}
      <div
        style={{
          marginLeft: "80px",
          width: sidebarOpen ? "320px" : "0px",
          transition: "width 200ms ease",
          position: "relative",
          backgroundColor: "var(--card-bg)",
          borderRight: "1px solid var(--color-border-primary)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.5rem 1rem",
            borderBottom: "1px solid var(--color-border-primary)",
            backgroundColor: "var(--header-bg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaCode style={{ color: "var(--accent-primary)" }} />
              Code Files
            </h1>
            <button
              onClick={() => setShowNewFileModal(true)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-dark)",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
              title="Create New File"
            >
              <FaPlus />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
              }}
            />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "0.5rem",
                backgroundColor: "var(--color-surface)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
              }}
            />
          </div>
        </div>

        {/* Filters and Sorting */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid var(--color-border-primary)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <FaFilter
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "0.25rem",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
              }}
            >
              <option value="all">All Files</option>
              <option value="important">Important</option>
              <option value="shared">Shared</option>
              <option value="language">By Language</option>
            </select>
          </div>

          {filterBy === "language" && (
            <div style={{ marginBottom: "0.75rem" }}>
              <select
                value={selectedLanguageFilter}
                onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.25rem",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                }}
              >
                <option value="all">All Languages</option>
                {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "0.25rem",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
              }}
            >
              <option value="lastModified">Last Modified</option>
              <option value="title">Title</option>
              <option value="createdAt">Created Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              style={{
                padding: "0.5rem",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "0.25rem",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
        </div>

        {/* Files List */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "0.5rem",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                color: "var(--text-secondary)",
              }}
            >
              <FaSpinner
                style={{
                  animation: "spin 1s linear infinite",
                  marginRight: "0.5rem",
                }}
              />
              Loading files...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              <FaFileCode
                style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
              />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                {searchQuery || filterBy !== "all"
                  ? "No files match your criteria"
                  : "No code files yet"}
              </p>
              {!searchQuery && filterBy === "all" && (
                <button
                  onClick={() => setShowNewFileModal(true)}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--text-dark)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Create your first file
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {filteredFiles.map((file) => (
                <div
                  key={file._id}
                  onClick={() => handleFileSelect(file)}
                  title={
                    selectedFile?._id === file._id ? "Selected file" : undefined
                  } // Fix here
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    backgroundColor:
                      selectedFile?._id === file._id
                        ? "var(--upload-bg)"
                        : "var(--feature-card-bg)",
                    border: `1px solid ${
                      selectedFile?._id === file._id
                        ? "var(--accent-primary)"
                        : "var(--color-border-secondary)"
                    }`,
                    transition: "all 0.2s ease",
                    ":hover": {
                      backgroundColor: "var(--sidebar-bg)",
                    },
                  }}
                  // onMouseEnter={(e) => {
                  //   if (selectedFile?._id !== file._id) {
                  //     e.target.style.backgroundColor = "var(--sidebar-bg)";
                  //   }
                  // }}
                  // onMouseLeave={(e) => {
                  //   if (selectedFile?._id !== file._id) {
                  //     e.target.style.backgroundColor = "transparent";
                  //   }
                  // }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      // marginBottom: '0.5rem',
                      // background: 'red',
                      // border :'1px solid var(--border-accent)',
                      // padding : '1rem',
                      // borderRadius : '1rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingFileId === file._id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() =>
                            handleFileRename(file._id, editingTitle)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleFileRename(file._id, editingTitle);
                            if (e.key === "Escape") {
                              setEditingFileId(null);
                              setEditingTitle("");
                            }
                          }}
                          style={{
                            width: "100%",
                            border: "1px solid var(--accent-primary)",
                            borderRadius: "0.25rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "var(--card-bg)",
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <FaFileCode
                            style={{
                              color: getLanguageColor(file.language),
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}
                          />
                          <h3
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "bold",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--text-primary)",
                            }}
                          >
                            {file.title}
                          </h3>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            color: "white",
                            textShadow: "0px 0px 5px black",
                            backgroundColor: getLanguageColor(
                              file.prog_language
                            ),
                          }}
                        >
                          {LANGUAGE_CONFIG[file.prog_language]?.label ||
                            file.prog_language}
                        </span>

                        {file.important && (
                          <FaStar
                            style={{
                              color: "var(--color-accent-highlight)",
                              fontSize: "0.8rem",
                            }}
                          />
                        )}

                        {file.isShared && (
                          <FaShare
                            style={{
                              color: "var(--accent-primary)",
                              fontSize: "0.8rem",
                            }}
                          />
                        )}
                      </div>

                      {file.tags && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            margin: "0 0 0.5rem 0",
                            lineHeight: "1.3",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            // background: 'var(--accent-primary)'
                          }}
                        >
                          {file.tags.map((tag, index) => (
                            <span
                              key={index}
                              style={{
                                margin: "0.2rem",
                                background: "var(--border-accent)",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "2rem",
                                border: "1px solid var(--accent-primary)",
                                fontSize: "0.85rem",
                                display: "inline-block",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </p>
                      )}

                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span>{formatDate(file.updatedAt)}</span>
                        {file.viewCount > 0 && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaEye /> {file.viewCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFileId(file._id);
                          setEditingTitle(file.title);
                        }}
                        style={{
                          padding: "0.25rem",
                          border: "none",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                        title="Rename"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleImportant(file._id);
                        }}
                        style={{
                          padding: "0.25rem",
                          border: "none",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          color: file.important
                            ? "var(--color-accent-highlight)"
                            : "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                        title="Toggle Important"
                      >
                        {file.important ? <FaStar /> : <FaRegStar />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                          setShowDeleteModal(true);
                        }}
                        style={{
                          padding: "0.25rem",
                          border: "none",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          color: "var(--color-error)",
                          fontSize: "0.8rem",
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid var(--color-border-primary)",
            backgroundColor: "var(--color-surface)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
          {searchQuery && " found"}
        </div>
      </div>

      {/* OUTSIDE collapse handle (sits on the seam between sidebar and main area) */}
      {(() => {
        const sidebarWidth = sidebarOpen ? 415 : 100; // st match your sidebar width values
        const handleSize = 34; // px diameter
        // center the handle on the seam: left = sidebarWidth - handleSize/2
        const leftPos = sidebarWidth - Math.round(handleSize / 2);

        return (
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Collapse" : "Open"}
            style={{
              position: "absolute",
              top: 30, // tweak to vertically align with header
              left: `${leftPos}px`,
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              borderRadius: "50%",
              border: "2px solid var(--accent-primary)",
              backgroundColor: sidebarOpen
                ? "rgba(16,185,129,0.06)"
                : "var(--card-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              transition:
                "left 180ms ease, transform 180ms ease, background-color 180ms ease",
              zIndex: 1,
              padding: 0,
            }}
          >
            <FaChevronLeft
              style={{
                transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 180ms ease",
                fontSize: "16px",
              }}
            />
          </button>
        );
      })()}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* {selectedFile?._id} */}
        {selectedFile ? (
          <CodeEditor
            key={selectedFile._id}
            codeFileId={selectedFile._id}
            initialData={selectedFile}
            onExit={() => setSelectedFile(null)}
            onSave={handleFileUpdate}
            onRename={(newTitle) => {
              setCodeFiles((prev) =>
                prev.map((file) =>
                  file._id === selectedFile._id
                    ? { ...file, title: newTitle }
                    : file
                )
              );
            }}
            onToggleImportant={(isImportant) => {
              setCodeFiles((prev) =>
                prev.map((file) =>
                  file._id === selectedFile._id
                    ? { ...file, important: isImportant }
                    : file
                )
              );
            }}
            onShare={() => {
              setCodeFiles((prev) =>
                prev.map((file) =>
                  file._id === selectedFile._id
                    ? { ...file, isShared: true }
                    : file
                )
              );
            }}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--background-primary)",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem",
                maxWidth: "500px",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-surface)",
                  border: "2px dashed var(--color-border-secondary)",
                }}
              >
                <FaCode
                  style={{
                    fontSize: "4rem",
                    color: "var(--accent-primary)",
                    opacity: 0.6,
                  }}
                />
              </div>

              <div>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    margin: "0 0 0.5rem 0",
                    color: "var(--text-primary)",
                  }}
                >
                  Welcome to{" "}
                  <span
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      margin: "0 0 0.5rem 0",
                      color: "var(--accent-primary)",
                    }}
                  >
                    Code Verse
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: ".95rem",
                    color: "var(--text-secondary)",
                    margin: "0 0 2rem 0",
                    lineHeight: "1.6",
                  }}
                >
                  Select a file from the sidebar to start editing, or Goto Code
                  Contest .
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setShowNewFileModal(true)}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    border: "1px dashed var(--accent-primary)",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    // boxShadow: '0 2px 8px rgba(104, 211, 145, 0.3)'
                  }}
                >
                  <FaPlus />

                  <span>New File</span>
                </button>
                <Link
                  to={`/feature/code-contest`}
                  style={{ textDecoration: "none" }}
                >
                  <button
                    style={{
                      padding: "1rem 2rem",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      backgroundColor: "var(--accent-primary)",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {/* <FaSearch /> */}
                    <FaCode />
                    <span>Code Contest</span>
                  </button>
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {/* <FaLightbulb style={{ color: 'var(--accent-primary)' }} /> */}
                  {/* <span>Pro Tip: Press Ctrl+K to quickly search files</span> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "0.75rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              border: "1px solid var(--color-border-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}
              >
                Create New File
              </h2>
              <button
                onClick={() => setShowNewFileModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "1.25rem",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                File Name
              </label>
              <input
                type="text"
                value={newFileTitle}
                onChange={(e) => setNewFileTitle(e.target.value)}
                placeholder="Enter file name"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                Language
              </label>
              <select
                value={newFileLanguage}
                onChange={(e) => setNewFileLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
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
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                Description (Optional)
              </label>
              <textarea
                value={newFileDescription}
                onChange={(e) => setNewFileDescription(e.target.value)}
                placeholder="Enter a short description"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border-secondary)",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  minHeight: "80px",
                  resize: "vertical",
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
                onClick={() => setShowNewFileModal(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                disabled={!newFileTitle.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--text-dark)",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  opacity: !newFileTitle.trim() ? 0.6 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "0.75rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              border: "1px solid var(--color-border-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}
              >
                Confirm Delete
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "1.25rem",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <p
              style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {fileToDelete.title}
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(fileToDelete._id)}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeFilesDashboard;