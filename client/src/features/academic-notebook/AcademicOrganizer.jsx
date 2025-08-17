import React, { useState, useEffect, useRef, useMemo } from "react";
const backendURL = import.meta.env.VITE_BACKEND_URL;
const frontenedURL = import.meta.env.VITE_FRONTENED_URL;
import {
  FaFolder,
  FaFolderOpen,
  FaFilePdf,
  FaImage,
  FaStickyNote,
  FaPlus,
  FaStar,
  FaTrash,
  FaSearch,
  FaBars,
  FaTimes,
  FaEdit,
  FaShare,
  FaGlobe,
  FaCopy,
  FaUnlink,
  FaEye,
  FaClock,
  FaArrowsAlt,
} from "react-icons/fa";
import { FiUploadCloud, FiChevronLeft } from "react-icons/fi";
import "./AcademicOrganizer.css";
import AcademicUploader_Modal from "./AcademicUploader_Modal";
import RenamePrompt from "./RenamePrompt";
import Notebook from "../ai-notepad/Notebook";
import ModernPDFViewer from "../ai-notepad/ModernPDFViewer";
import axios from "axios";
import { SquaresLoader, InlineLoader } from "../../components/Loader";
import AiHelpers from "../ai-notepad/AiHelpers";
import { toast } from "react-toastify";

let userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const AcademicOrganizer = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [recentFiles, setRecentFiles] = useState([]);

  const [creatingType, setCreatingType] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showNewModal, setShowNewModal] = useState(false);

  // const [moving, setMoving] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [sharedNotebooks, setSharedNotebooks] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [uploading, setUploading] = useState(false);

  // New states implemented
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [materials, setMaterials] = useState({
    notebooks: [],
    handwrittenNotes: [],
  });
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  const [viewerType, setViewerType] = useState(null);
  const [notebookContent, setNotebookContent] = useState(null);

  const [editingYearId, setEditingYearId] = useState(null);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [showNotebookForm, setShowNotebookForm] = useState(false);

  const [chatActive, setChatActive] = useState(false);
  const panelRef = useRef(null);

  const [allFiles, setAllFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [isFetchingAllFiles, setIsFetchingAllFiles] = useState(false);
  const [allFilesFetched, setAllFilesFetched] = useState(false);
  const [fetchAllFilesError, setFetchAllFilesError] = useState(null);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  // ✅ FIX 2: Clear all user-specific data when component mounts
  const clearUserData = () => {
    console.log("[Clear] Clearing all user-specific data");
    setYears([]);
    setSubjects([]);
    setChapters([]);
    setMaterials({ notebooks: [], handwrittenNotes: [] });
    setAllFiles([]);
    setRecentFiles([]);
    setSharedNotebooks([]);
    setSelectedYear(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedFile(null);
    setSelectedYearId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedNotebook(null);
    setViewerType(null);
    setNotebookContent(null);
    // setAllFilesFetched(false);
    setSearchTerm("");
    setShowSearchResults(false);
  };

useEffect(() => {
    const handleStorageChange = () => {
      const newUserId = localStorage.getItem("userId");
      const newToken = localStorage.getItem("token");
      

      // If userId changed or user logged out
      if (newUserId !== userId || !newUserId || !newToken) {
        console.log(`[Auth] User changed from ${userId} to ${newUserId}`);
        clearUserData();
        
        if (newUserId && newToken) {
          // New user logged in, refetch data
          userId = newUserId;
          fetchYears();
        } else {
          setYearsLoading(false);
        }
      }
    };
    // Listen for storage changes (logout/login)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  // ✅ Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setChatActive(false);
      }
    };

    if (chatActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [chatActive]);

  const openInNotes = (file) => {
    handleFileClick(file);
    setActiveTab("notes");
  };

  // ✅ FIX: Add initial useEffect to fetch years and all files on component mount
  useEffect(() => {
    console.log("[Component Mount] AcademicOrganizer mounted");
    
    const currentUserId = localStorage.getItem("userId");
    const currentToken = localStorage.getItem("token");
    
    if (currentUserId && currentToken) {
      userId = currentUserId; // Update global variable
      // fetchYears();
      fetchAllFiles();
    } else {
      console.log("[Component Mount] No auth credentials found");
      setYearsLoading(false);
    }
  }, []);


  useEffect(() => {
    const fetchYears = async () => {
      const currentUserId = localStorage.getItem("userId");
      const currentToken = localStorage.getItem("token");
      
      if (!currentUserId || !currentToken) {
        console.log("[API] No auth credentials, skipping years fetch");
              setYearsLoading(false);
        return;
      }
      
      try {
              setYearsLoading(true);
        const res = await axios.get(`${backendURL}/years`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log(res);
        
        setYears(res.data);
      } catch (err) {
        console.error("Error fetching years:", err);
        if (err.response?.status === 401) {
          // Token expired or invalid, clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          clearUserData();
        }
      }finally {
        setYearsLoading(false);
      }
    };
    fetchYears();
  }, []);


  // sharing useeffect
  useEffect(() => {
    if (
      activeTab === "shared" &&
      sharedNotebooks.length === 0 &&
      !sharedLoading
    ) {
      fetchSharedNotebooks();
    }
  }, [activeTab]);

  // Fetch subjects when year is selected
  useEffect(() => {
    if (selectedYearId) {
      const fetchSubjects = async () => {
        try {
          setSubjectsLoading(true);
          const res = await axios.get(
            `${backendURL}/years/${selectedYearId}/subjects`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setSubjects(res.data);
        } catch (err) {
          console.error("Error fetching subjects:", err);
        } finally {
          setSubjectsLoading(false);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedYearId]);

  // Fetch chapters when subject is selected

  useEffect(() => {
    if (selectedSubjectId) {
      const fetchChapters = async () => {
        try {
          setChaptersLoading(true);
          const res = await axios.get(
            `${backendURL}/years/subjects/${selectedSubjectId}/chapters`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setChapters(res.data);
        } catch (err) {
          console.error("Error fetching chapters:", err);
        } finally {
          setChaptersLoading(false);
        }
      };
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [selectedSubjectId]);

    useEffect(() => {
    if (showSearchResults && searchTerm.trim() !== "" && allFiles.length === 0) {
      fetchAllFiles();
    }
  }, [showSearchResults, searchTerm]);
  // shareing relaetd
  const fetchSharedNotebooks = async () => {
    
    const currentUserId = localStorage.getItem("userId");
    const currentToken = localStorage.getItem("token");
        if (!currentUserId || !currentToken) return;
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await axios.get(
        `${backendURL}/api/share/user/notebooks/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);

      setSharedNotebooks(response.data);
    } catch (err) {
      console.error("Error fetching shared notebooks:", err);
      setSharedError("Failed to load shared notebooks");
    } finally {
      setSharedLoading(false);
    }
  };
  const handleShareLinkGenerated = () => {
    fetchSharedNotebooks();
  };

  const handleRevokeShare = async (shareId) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this share link? People with this link will no longer be able to access the notebook."
      )
    ) {
      return;
    }
    const currentUserId = localStorage.getItem("userId");
    const currentToken = localStorage.getToken("token");
    try {
      await axios.delete(
        `${backendURL}/api/share/notebook/${currentUserId}/${shareId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSharedNotebooks((prev) =>
        prev.filter((item) => item.shareId !== shareId)
      );
      toast.success("Share link revoked successfully");
    } catch (err) {
      console.error("Error revoking share:", err);
      toast.error("Failed to revoke share link");
    }
  };

  const handleCopyShareLink = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  // Fetch materials when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      setFileLoading(true);
      // setChaptersLoading(true);
      setError(null);
      axios
        .get(`${backendURL}/years/${selectedChapterId}/materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => setMaterials(res.data))
        .catch((err) => {
          console.error("Error fetching materials:", err);
          setError("Failed to load materials");
        })
        .finally(() => {
          // setLoading(false);
          setFileLoading(false);
        });
    }
  }, [selectedChapterId]);
  // Fetch all files for search when needed
  const fetchAllFiles = async () => {
    const currentUserId = localStorage.getItem("userId");
    const currentToken = localStorage.getItem("token");
        
    if (!currentUserId || !currentToken) {
      console.log("[fetchAllFiles] No auth credentials available");
      return;
    }

    setFilesLoading(true);
    try {
      const allFilesData = [];

      const yearsRes = await axios.get(`${backendURL}/years`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
      });
      const years = yearsRes.data;

      for (const year of years) {
        const subjectsRes = await axios.get(
          `${backendURL}/years/${year._id}/subjects`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const subjects = subjectsRes.data;

        for (const subject of subjects) {
          const chaptersRes = await axios.get(
            `${backendURL}/years/subjects/${subject._id}/chapters`,
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const chapters = chaptersRes.data;

          for (const chapter of chapters) {
            try {
              const materialsRes = await axios.get(
                `${backendURL}/years/${chapter._id}/materials`,
                {
                  headers: {
                    Authorization: `Bearer ${currentToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              const materials = materialsRes.data;

              if (materials.notebooks) {
                materials.notebooks.forEach((notebook) => {
                  allFilesData.push({
                    ...notebook,
                    type: "notebook",
                    yearId: year._id,
                    yearTitle: year.title,
                    subjectId: subject._id,
                    subjectName: subject.name,
                    chapterId: chapter._id,
                    chapterTitle: chapter.title,
                    fullPath: `${year.title} / ${subject.name} / ${chapter.title}`,
                    searchableText: notebook.name.toLowerCase(),
                  });
                });
              }

              if (materials.handwrittenNotes) {
                materials.handwrittenNotes.forEach((note) => {
                  allFilesData.push({
                    ...note,
                    type: "handwritten",
                    yearId: year._id,
                    yearTitle: year.title,
                    subjectId: subject._id,
                    subjectName: subject.name,
                    chapterId: chapter._id,
                    chapterTitle: chapter.title,
                    fullPath: `${year.title} / ${subject.name} / ${chapter.title}`,
                    searchableText: note.title.toLowerCase(),
                  });
                });
              }
            } catch (chapterErr) {
              console.warn(
                `Failed to fetch materials for chapter ${chapter.title}:`,
                chapterErr
              );
            }
          }
        }
      }
      console.log(`Loaded ${allFilesData.length} files for search for user ${currentUserId}`);
      setAllFiles(allFilesData);
    } catch (err) {
      console.error("Error fetching all files:", err);
    } finally {
      setFilesLoading(false);
    }
  };
  const handleYearClick = (yearId) => {
    setSelectedFile(null); // ✅ close any open file
    setViewerType(null);
    const yearData = years.find((y) => y._id === yearId);
    if (selectedYearId === yearId) {
      setSelectedYearId(null);
      setSelectedYear(null);
      setSubjects([]);
      setChapters([]);
      setMaterials({ notebooks: [], handwrittenNotes: [] });
    } else {
      setSelectedYearId(yearId);
      setSelectedYear(yearData?.title);
      setSubjects([]);
      setChapters([]);
      setMaterials({ notebooks: [], handwrittenNotes: [] });
    }
  };

  const handleSubjectClick = (subjectId) => {
    setSelectedFile(null);
    setViewerType(null);

    const subjectData = subjects.find((s) => s._id === subjectId);
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
      setSelectedSubject(null);
    } else {
      setSelectedSubjectId(subjectId);
      setSelectedSubject(subjectData?.name);
    }

    // Clear dependent states
    setChapters([]);
    setMaterials({ notebooks: [], handwrittenNotes: [] });
    setSelectedChapterId(null);
    setSelectedNotebook(null);
  };

  const handleChapterClick = (chapterId) => {
    console.log("chapter click", chapterId, selectedChapterId);

    setSelectedFile(null);
    setViewerType(null);

    const chapterData = chapters.find((c) => c._id === chapterId);
    if (selectedChapterId === chapterId) {
      setSelectedChapterId(null);
      setSelectedChapter(null);
    } else {
      setSelectedChapterId(chapterId);
      setSelectedChapter(chapterData?.title);
    }

    // Clear previous materials + notebook
    setMaterials({ notebooks: [], handwrittenNotes: [] });
    setSelectedNotebook(null);
  };

  const handleFileClick = async (file) => {
    // console.log(file._id);
    // /api/notebooks/_id
    setSelectedFile(file);
    setViewerType(null); // reset before loading new
    setFileLoading(true);
    // Track as a recent file
    setRecentFiles((prev) => [
      { ...file, timestamp: new Date() },
      ...prev.filter((f) => f._id !== file._id).slice(0, 4),
    ]);

    if (file.type === "notebook") {
      try {
        const res = await axios.get(`${backendURL}/api/notebooks/${file._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        // console.log(res)  ;
        
        setNotebookContent(res.data);
        // setFileLoading(false);
        setViewerType("notebook");
      } catch (err) {
        console.error("Error loading notebook:", err);
      } finally {
        setFileLoading(false);
      }
    } else if (file.type === "handwritten") {
      setViewerType("pdf"); // we'll use file.fileUrl to view this
          setFileLoading(false);
    } else {
      console.warn("Unknown file type");
          setFileLoading(false);
    }
  };

  // Handle closing file view
  const handleCloseFile = () => {
    setSelectedFile(null);
    setFileLoading(null);
  };

    // Function to load chapter context and open file from search results
  const loadChapterAndOpenFile = async (file) => {
    try {
      console.log("Opening file from search:", file);
      
      // Set the hierarchy to navigate to the file's location
      setSelectedYearId(file.yearId);
      setSelectedYear(file.yearTitle);
      setSelectedSubjectId(file.subjectId);
      setSelectedSubject(file.subjectName);
      setSelectedChapterId(file.chapterId);
      setSelectedChapter(file.chapterTitle);

      // Close search and switch to notes tab
      setShowSearchResults(false);
      setSearchTerm("");
      setActiveTab("notes");

      // Open the file after a brief delay to allow materials to load
      setTimeout(() => {
        handleFileClick(file);
      }, 300);
    } catch (err) {
      console.error("Failed to navigate to file:", err);
    }
  };

  const handleCreateYear = async (title) => {
    try {
      const res = await axios.post(
        `${backendURL}/years`,
        {
          title,
          important: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setYears((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating year:", err);
      alert("Failed to create year");
    }
  };

  const handleToggleImportantYear = async (yearId) => {
    try {
      const year = years.find((y) => y._id === yearId);
      if (!year) return;

      const updated = await axios.patch(
        `${backendURL}/years/${yearId}`,
        {
          important: !year.important,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setYears((prev) =>
        prev.map((y) =>
          y._id === yearId ? { ...y, important: updated.data.important } : y
        )
      );
    } catch (err) {
      console.error("Failed to toggle year importance:", err);
      alert("Failed to update year");
    }
  };

  const renameYear = async (yearId, newTitle) => {
    try {
      console.log(yearId, newTitle);

      await axios.patch(
        `${backendURL}/years/rename/${yearId}`,
        {
          title: newTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setYears((prev) =>
        prev.map((y) => (y._id === yearId ? { ...y, title: newTitle } : y))
      );
      setEditingYearId(null);
    } catch (err) {
      console.error("Rename year failed", err);
    }
  };

  // Delete function for the folders only
  const handleDeleteItem = async (type, id) => {
    setDeleteTarget(true);
    try {
      if (type === "year") {
        await axios.delete(`${backendURL}/years/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setYears((prev) => prev.filter((y) => y._id !== id));

        if (selectedYearId === id) {
          setSelectedYearId(null);
          setSubjects([]);
          setSelectedSubjectId(null);
          setChapters([]);
          setSelectedChapterId(null);
          setMaterials({ notebooks: [], handwrittenNotes: [] });
        }
      } else if (type === "subject") {
        await axios.delete(`${backendURL}/years/subjects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setSubjects((prev) => prev.filter((s) => s._id !== id));

        if (selectedSubjectId === id) {
          setSelectedSubjectId(null);
          setChapters([]);
          setSelectedChapterId(null);
          setMaterials({ notebooks: [], handwrittenNotes: [] });
        }
      } else if (type === "chapter") {
        await axios.delete(`${backendURL}/years/subjects/chapters/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setChapters((prev) => prev.filter((c) => c._id !== id));

        if (selectedChapterId === id) {
          setSelectedChapterId(null);
          setMaterials({ notebooks: [], handwrittenNotes: [] });
        }
      }
    } catch (err) {
      alert("Deletion failed.");
      console.error(err);
    }
  };
  // passing this to the child
  const exitToListView = () => {
    setSelectedFile(null); // or navigate("/materials") if using react-router
  };

  // For the notebook and written notes
  const handleDeleteFile = async (file, type) => {
    // console.log(file._id, "note id", file.note_id);
    // if (!window.confirm("Are you sure you want to delete this file?")) return;
    // setDeleteTarget(true);

    try {
      if (type === "notebook") {
        await axios.delete(`${backendURL}/api/notebooks/${file._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMaterials((prev) => ({
          ...prev,
          notebooks: prev.notebooks.filter((n) => n._id !== file._id),
        }));

        if (
          selectedFile?.type === "notebook" &&
          selectedFile.fileUrl === file.note_id
        ) {
          handleCloseFile(); // optional: clear preview if open
        }
        // toast.success("File Deleted")
      } else if (type === "handwritten") {
        console.log(type, file._id);

        await axios.delete(`${backendURL}/api/handwritten-notes/${file._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMaterials((prev) => ({
          ...prev,
          handwrittenNotes: prev.handwrittenNotes.filter(
            (n) => n._id !== file._id
          ),
        }));

        if (
          selectedFile?.type === "handwritten" &&
          selectedFile.name === file.title
        ) {
          handleCloseFile();
        }
      }
      handleCloseFile();
      toast.warning("File Deleted");
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert("Could not delete the file.");
    }
  };

  const handleCreateSubject = async (name) => {
    if (!selectedYearId) {
      alert("Please select a year first.");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/years/${selectedYearId}/subjects`,
        {
          name,
          important: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating subject:", err);
      alert("Failed to create subject");
    }
  };

  const handleToggleImportantSubject = async (subjectId) => {
    try {
      const subject = subjects.find((s) => s._id === subjectId);
      if (!subject) return;

      const updated = await axios.patch(
        `${backendURL}/years/subjects/${subjectId}`,
        {
          important: !subject.important,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubjects((prev) =>
        prev.map((s) =>
          s._id === subjectId ? { ...s, important: updated.data.important } : s
        )
      );
    } catch (err) {
      console.error("Failed to toggle subject importance:", err);
      alert("Failed to update subject");
    }
  };

  const renameSubject = async (subjectId, newName) => {
    try {
      const subject = subjects.find((s) => s._id === subjectId);
      if (!subject) return;

      await axios.patch(
        `${backendURL}/years/subjects/rename/${subjectId}`,
        {
          name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSubjects((prev) =>
        prev.map((s) => (s._id === subjectId ? { ...s, name: newName } : s))
      );
      setEditingSubjectId(null);
    } catch (err) {
      console.error("Rename subject failed", err);
    }
  };

  const handleCreateChapter = async (chapterTitle) => {
    if (!selectedSubjectId) {
      alert("Please select a subject first.");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/years/subjects/${selectedSubjectId}/chapters`,
        { chapterTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state — assuming chapters come directly
      setChapters((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating chapter:", err);
      alert("Failed to create chapter");
    }
  };

  const handleToggleImportantChapter = async (chapterId) => {
    try {
      const chapter = chapters.find((ch) => ch._id === chapterId);
      if (!chapter) return;
      console.log(chapter);

      const updated = await axios.patch(
        `${backendURL}/years/subjects/chapters/${chapterId}`,
        {
          important: !chapter.important,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setChapters((prev) =>
        prev.map((ch) =>
          ch._id === chapterId
            ? { ...ch, important: updated.data.important }
            : ch
        )
      );
    } catch (err) {
      console.error("Failed to toggle chapter importance:", err);
    }
  };

  const renameChapter = async (chapterId, newTitle) => {
    try {
      await axios.patch(
        `${backendURL}/years/subjects/chapters/rename/${chapterId}`,
        {
          title: newTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setChapters((prev) =>
        prev.map((c) => (c._id === chapterId ? { ...c, title: newTitle } : c))
      );
      setEditingChapterId(null);
    } catch (err) {
      console.error("Rename chapter failed", err);
    }
  };

  // Rename notebook
  const renameNotebook = async (noteId, newName) => {
    await axios.patch(
      `${backendURL}/api/notebooks/${noteId}/rename`,
      {
        name: newName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  // Toggle important notebook
  const toggleImportantNotebook = async (noteId) => {

    await axios.patch(`${backendURL}/api/notebooks/${noteId}/important`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  // Rename scanned note
  const renameScannedNote = async (noteId, newTitle) => {
    await axios.patch(
      `${backendURL}/api/handwritten-notes/${noteId}/rename`,
      {
        title: newTitle,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  // Toggle important scanned note
  const toggleImportantScannedNote = async (noteId) => {
    console.log(noteId);

    await axios.patch(
      `${backendURL}/api/handwritten-notes/${noteId}/important`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const handleRename = async (file, type, newName) => {
    try {
      if (type === "notebook") {
        await renameNotebook(file._id, newName);
        setMaterials((prev) => ({
          ...prev,
          notebooks: prev.notebooks.map((n) =>
            n._id === file._id ? { ...n, name: newName } : n
          ),
        }));
        setSelectedFile((prev) =>
          prev && prev._id === file._id ? { ...prev, name: newName } : prev
        );
      } else {
        await renameScannedNote(file._id, newName);
        setMaterials((prev) => ({
          ...prev,
          handwrittenNotes: prev.handwrittenNotes.map((n) =>
            n._id === file._id ? { ...n, title: newName } : n
          ),
        }));
      }
    } catch (err) {
      console.error("Rename failed:", err);
      alert("Failed to rename");
    }
  };

  // This toggle works for only the notebook and handwrittenNotes
  const handleToggleImportant = async (file, type) => {
    try {
      if (type === "notebook") {
        await toggleImportantNotebook(file._id);
        setMaterials((prev) => ({
          ...prev,
          notebooks: prev.notebooks.map((n) =>
            n._id === file._id ? { ...n, important: !n.important } : n
          ),
        }));
      } else {
        await toggleImportantScannedNote(file._id);
        setMaterials((prev) => ({
          ...prev,
          handwrittenNotes: prev.handwrittenNotes.map((n) =>
            n._id === file._id ? { ...n, important: !n.important } : n
          ),
        }));
      }
      setAllFiles((prev) =>
        prev.map((f) =>
          f._id === file._id ? { ...f, important: !f.important } : f
        )
      );
    } catch (err) {
      console.error("Failed to toggle important:", err);
      alert("Could not update importance");
    }
  };

  // Handle context menu
  const handleContextMenu = (e, type, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      item,
    });
  };

  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const getSteps = () => {
    const steps = [];
    // console.log(selectedFile);

    if (selectedYear) steps.push({ label: selectedYear });
    if (selectedSubject) steps.push({ label: selectedSubject });
    if (selectedChapter) steps.push({ label: selectedChapter });
    if (selectedFile?.type == "notebook") {
      steps.push({ label: selectedFile?.name });
    } else if (selectedFile?.type == "handwritten") {
      steps.push({ label: selectedFile?.title });
    }
    return steps;
  };
  // Updated search function that uses allFiles
  const searchAllFiles = (searchTerm) => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allFiles.filter(
      (file) =>
        file.searchableText.includes(term) ||
        file.fullPath.toLowerCase().includes(term)
    );
  };
  // Get all files for search
  const getAllFiles = () => {
    const notebooks =
      materials.notebooks?.map((n) => ({ ...n, type: "notebook" })) || [];
    const handwritten =
      materials.handwrittenNotes?.map((n) => ({ ...n, type: "handwritten" })) ||
      [];
    return [...notebooks, ...handwritten];
  };

  // Filter files based on search
  const filteredFiles = () => {
    const allFiles = getAllFiles();
    if (!searchTerm) {
      const notebooks =
        materials.notebooks?.map((n) => ({ ...n, type: "notebook" })) || [];
      const handwritten =
        materials.handwrittenNotes?.map((n) => ({
          ...n,
          type: "handwritten",
        })) || [];
      return [...notebooks, ...handwritten];
    }
    return searchAllFiles(searchTerm);
  };

  // Upload purpose
  const handleUploadFile = async (file, title) => {
    if (!file || !selectedChapterId) {
      alert("Missing file or chapter.");
      return;
    }
    toast.info("Uploading file...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chapter", selectedChapterId);
    formData.append("title", title);
    try {
      setUploading(true);
      const res = await axios.post(
        `${backendURL}/api/handwritten-notes/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedFile = res.data;
      console.log("[Upload] Success:", uploadedFile);

      setShowNewModal(false);
      setSelectedChapterId(null); // Clear first

      setTimeout(() => {
        setSelectedChapterId(selectedChapterId); // Re-set to trigger useEffect
      }, 100);
      // toast.success("Upload successful!", {
      //   theme: "colored",
      // });
    } catch (err) {
      console.error("[Upload] Failed:", err);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false); // Stop loader
    }
  };

  // Handle saving notebook
  const handleSaveNotebook = async (notebookData) => {
    try {
      // Save notebook logic hereb
      console.log("Saving notebook:", notebookData);
    } catch (err) {
      console.error("Failed to save notebook:", err);
    }
  };

  const tabsRef = useRef(null);
  const sliderRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "recent", label: "Recent" },
    { id: "important", label: "Important" },
    { id: "shared", label: "Shared" },
  ];

  // Update slider position when active tab changes
  useEffect(() => {
    if (tabsRef.current && sliderRef.current) {
      const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
      const activeTabElement = tabsRef.current.children[activeTabIndex + 1]; // +1 because slider is first child

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
        setSliderStyle({
          transform: `translateX(${offsetLeft}px)`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [activeTab]);

  // Initialize slider position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tabsRef.current) {
        const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
        const activeTabElement = tabsRef.current.children[activeTabIndex + 1];

        if (activeTabElement) {
          const { offsetLeft, offsetWidth } = activeTabElement;
          setSliderStyle({
            transform: `translateX(${offsetLeft}px)`,
            width: `${offsetWidth}px`,
          });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  return (
    <div
      className={`ao-container ${sidebarOpen ? "" : "collapsed"}`}
      onClick={handleCloseContextMenu}
    >
      {/* Top Navigation */}
      <div className="ao-top-nav">
        <div className="ao-nav-left">
          <div className="app-name">
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-category-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 4h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 3h6m-3 -3v6" />
            </svg>
            Note Verse
          </div>
        </div>
        <div className="ao-nav-center">
          <div className="tabs-sliding" ref={tabsRef}>
            {/* Animated Background Slider */}
            <div className="tab-slider" ref={sliderRef} style={sliderStyle} />

            {tabs.map(({ id, label }) => (
              <button
                key={id}
                className={`tab-sliding ${activeTab === id ? "active" : ""}`}
                onClick={() => handleTabClick(id)}
                onMouseDown={(e) => {
                  if (e.currentTarget) {
                    e.currentTarget.style.transform =
                      "translate3d(0, 1px, 0) scale(0.98)";
                  }
                }}
                onMouseUp={(e) => {
                  setTimeout(() => {
                    if (e.currentTarget) {
                      e.currentTarget.style.transform =
                        "translate3d(0, 0, 0) scale(1)";
                    }
                  }, 100);
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget) {
                    e.currentTarget.style.transform =
                      "translate3d(0, 0, 0) scale(1)";
                  }
                }}
              >
                <span className="tab-text">{label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* chatbot */}
        <div className="ao-nav-right">
          <div className="chatbot-container">
            <button
              className="chatbot-icon-button"
              onClick={() => setChatActive((prev) => !prev)} // ✅ Fix: toggle state correctly
              aria-label="Open YuktiVerse Chat"
            >
              <div className="chatbot-icon-ripple" />
              <div className="chatbot-glow" />
              <div className="chatbot-icon-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="chatbot-icon"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-2.8 9.286a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414m-5.69 -4.286h-.01a1 1 0 1 0 0 2h.01a1 1 0 0 0 0 -2m5 0h-.01a1 1 0 0 0 0 2h.01a1 1 0 0 0 0 -2" />
                </svg>
              </div>
            </button>
          </div>
          {chatActive && (
            <div ref={panelRef}>
              <AiHelpers
                text="Hi"
                onClose={() => setChatActive(false)} // ✅ Pass close handler
                mode="chatbot"
              />
            </div>
          )}

          <div className="global-search-container">
            <div className="search-input-container">
              <FaSearch className="ao-search-icon" />
              <input
                className="global-search-bar"
                placeholder="Search all files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 200)
                }
              />
            </div>

            {showSearchResults && searchTerm.trim() !== "" && (
              <div className="global-search-results">
                {isFetchingAllFiles ? (
                  <SquaresLoader />
                ) : fetchAllFilesError ? (
                  <div className="ao-error">{fetchAllFilesError}</div>
                ) : (
                  <>
                    {searchAllFiles(searchTerm).map((file, index) => (
                      <div
                        key={`${file._id}-${index}`}
                        className="search-result-item"
                        onClick={() => {
                          handleFileClick(file);
                          loadChapterAndOpenFile(file);
                          setSearchTerm("");
                          setShowSearchResults(false);
                        }}
                      >
                        <div className="search-result-icon">
                          {file.type === "notebook" && <FaStickyNote />}
                          {file.type === "handwritten" && <FaFilePdf />}
                        </div>
                        <div className="search-result-name">
                          {file.type === "notebook" ? file.name : file.title}
                        </div>
                        <div className="search-result-path">
                          {file.fullPath}
                        </div>
                      </div>
                    ))}
                    {searchAllFiles(searchTerm).length === 0 && (
                      <div className="no-results">No matching files found.</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`ao-sidebar-wrapper ${sidebarOpen ? "open" : "collapsed"}`}
      >
        <button
          className="ao-collapse-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          data-tooltip={sidebarOpen ? "Collapse" : "Expand"}
        >
          <FiChevronLeft
            className={`ao-collapse-icon ${sidebarOpen ? "" : "rotated"}`}
          />
        </button>

        <div className="ao-sidebar">
          <div className="sidebar-content">
            {yearsLoading ? (
              <InlineLoader />
            ) : (
              years.map((year) => (
                <div key={year._id} className="ao-section">
                  <button
                    className={`ao-button ${
                      selectedYearId === year._id ? "active" : ""
                    }`}
                    onClick={() => handleYearClick(year._id)}
                    onContextMenu={(e) => handleContextMenu(e, "year", year)}
                  >
                    <div className="star-icon-ao">
                      {selectedYearId === year._id ? (
                        <>
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
                            className="icon icon-tabler icons-tabler-outline icon-tabler-folder-open"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />
                          </svg>
                        </>
                      ) : (
                        <>
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
                            className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M9 6l6 6l-6 6" />
                          </svg>
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
                            className="icon icon-tabler icons-tabler-outline icon-tabler-folder"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                          </svg>
                        </>
                      )}
                    </div>
                    <div className="ao-name-file"> {year.title}</div>
                    {year.important && <FaStar className="ao-important-star" />}
                  </button>

                  {selectedYearId === year._id && (
                    <div className="ao-subsection">
                      {subjectsLoading ? (
                        <div style={{ padding: "10px", marginLeft: "20px" }}>
                          <InlineLoader type="dots" text="" />
                        </div>
                      ) : (
                        subjects.map((subject) => (
                          <div key={subject._id} className="ao-subitem">
                            <button
                              className={`ao-button ao-subbutton ${
                                selectedSubjectId === subject._id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => handleSubjectClick(subject._id)}
                              onContextMenu={(e) =>
                                handleContextMenu(e, "subject", subject)
                              }
                            >
                              {selectedSubjectId === subject._id ? (
                                <>
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
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M6 9l6 6l6 -6" />
                                  </svg>
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
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-folder-open"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </>
                              ) : (
                                <>
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
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M9 6l6 6l-6 6" />
                                  </svg>
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
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-folder"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                                  </svg>
                                </>
                              )}

                              <div className="ao-name-file">
                                {" "}
                                {subject.name}
                              </div>
                              {subject.important && (
                                <FaStar className="ao-important-star" />
                              )}
                            </button>

                            {selectedSubjectId === subject._id && (
                              <div className="ao-subsection">
                                {chaptersLoading ? (
                                  <div
                                    style={{
                                      padding: "8px",
                                      marginLeft: "40px",
                                    }}
                                  >
                                    <InlineLoader type="dots" text="" />
                                  </div>
                                ) : (
                                  chapters.map((chapter) => (
                                    <div
                                      key={chapter._id}
                                      className="ao-subitem"
                                    >
                                      <button
                                        className={`ao-button ao-subbutton ${
                                          selectedChapterId === chapter._id
                                            ? "active"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          handleChapterClick(chapter._id);
                                        }}
                                        onContextMenu={(e) =>
                                          handleContextMenu(
                                            e,
                                            "chapter",
                                            chapter
                                          )
                                        }
                                      >
                                        {selectedChapterId === chapter._id ? (
                                          <>
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
                                              <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                              />
                                              <path d="M6 9l6 6l6 -6" />
                                            </svg>
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
                                              className="icon icon-tabler icons-tabler-outline icon-tabler-folder-open"
                                            >
                                              <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                              />
                                              <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />
                                            </svg>
                                          </>
                                        ) : (
                                          <>
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
                                              className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
                                            >
                                              <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                              />
                                              <path d="M9 6l6 6l-6 6" />
                                            </svg>
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
                                              className="icon icon-tabler icons-tabler-outline icon-tabler-folder"
                                            >
                                              <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                              />
                                              <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                                            </svg>
                                          </>
                                        )}
                                        {chapter.title}
                                        {chapter.important && (
                                          <FaStar className="ao-important-star" />
                                        )}
                                      </button>
                                    </div>
                                  ))
                                )}

                                <div className="ao-create-section">
                                  {creatingType ===
                                  `chapter:${selectedSubjectId}` ? (
                                    <div className="ao-create-input">
                                      <input
                                        value={newItemName}
                                        onChange={(e) =>
                                          setNewItemName(e.target.value)
                                        }
                                        onKeyDown={async (e) => {
                                          if (
                                            e.key === "Enter" &&
                                            newItemName.trim()
                                          ) {
                                            await handleCreateChapter(
                                              newItemName.trim()
                                            );
                                            setNewItemName("");
                                            setCreatingType(null);
                                          }
                                          if (e.key === "Escape")
                                            setCreatingType(null);
                                        }}
                                        placeholder="Enter chapter title"
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      className="ao-create-button"
                                      onClick={() => {
                                        setCreatingType(
                                          `chapter:${selectedSubjectId}`
                                        );
                                        setNewItemName("");
                                      }}
                                    >
                                      <FaPlus />
                                      Chapter
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}

                      <div className="ao-create-section">
                        {creatingType === `subject:${selectedYearId}` ? (
                          <div className="ao-create-input">
                            <input
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter" && newItemName.trim()) {
                                  await handleCreateSubject(newItemName.trim());
                                  setNewItemName("");
                                  setCreatingType(null);
                                }
                                if (e.key === "Escape") setCreatingType(null);
                              }}
                              placeholder="Enter subject name"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            className="ao-create-button ao-subbutton"
                            onClick={() => {
                              setCreatingType(`subject:${selectedYearId}`);
                              setNewItemName("");
                            }}
                          >
                            <FaPlus /> New Subject
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <div className="ao-create-section">
              {creatingType === "year" ? (
                <div className="ao-create-input">
                  <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && newItemName.trim()) {
                        await handleCreateYear(newItemName.trim());
                        setNewItemName("");
                        setCreatingType(null);
                      }
                      if (e.key === "Escape") {
                        setCreatingType(null);
                      }
                    }}
                    placeholder="Enter year name"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  className="ao-create-button"
                  onClick={() => {
                    setCreatingType("year");
                    setNewItemName("");
                  }}
                >
                  <FaPlus /> Create New Year
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ao-main">
        <div className="ao-main-header">
          <div className="breadcrumb-stepper">
            {getSteps().map((step, index, arr) => (
              <div
                key={index}
                className={`breadcrumb-step ${
                  step.completed ? "completed" : "current"
                } ${index === arr.length - 1 ? "last" : ""}`}
              >
                <span className="ao-label">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="ao-actions">
            <button
              className="ao-action-btn"
              onClick={() => {
                setShowNewModal(!showNewModal);
              }}
            >
              <FaPlus /> New
            </button>
            {showNewModal && (
              <AcademicUploader_Modal
                onClose={() => setShowNewModal(false)}
                onFilesUploaded={handleUploadFile}
                onCreateNotebook={(newNotebook) => {
                  setMaterials((prev) => ({
                    ...prev,
                    notebooks: [...prev.notebooks, newNotebook],
                  }));
                }}
                selectedChapterId={selectedChapterId}
                passSetShowNewModal = {setShowNewModal}
              />
            )}
            {uploading && (
              <div className="ao-upload-loader-overlay">
                <SquaresLoader text="Uploading file..." />
              </div>
            )}
          </div>
        </div>

        {activeTab === "recent" && (
          <div className="recent-files">
            <h3>Recently Accessed Files</h3>
            <div className="recent-grid">
              {recentFiles.map((file, index) => (
                <div
                  key={index}
                  className="recent-card"
                  onClick={() => openInNotes(file)}
                >
                  <div className="ao-file-icon">
                    {file.type === "notebook" && <FaStickyNote />}

                    {file.type === "handwritten" &&
                      (file.fileType === "pdf" ? <FaFilePdf /> : <FaImage />)}

                    {file.type === "pdf" && <FaFilePdf />}

                    {file.type === "image" && <FaImage />}
                  </div>

                  <div className="ao-file-info">
                    <div className="ao-file-name">
                      {file.type === "notebook"
                        ? file.name
                        : file.title || file.name}
                    </div>
                    <div className="ao-file-date">Today</div>
                  </div>
                </div>
              ))}
              {recentFiles.length === 0 && (
                <div className="ao-empty-state">No recently accessed files</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "important" && (
          <div className="important-files">
            <h3>Important Files</h3>
            <div className="ao-files-grid">
              {allFiles
                .filter((f) => f.important)
                .map((file) => (
                  <div
                    key={file._id}
                    className="ao-file-card"
                    onClick={() => openInNotes(file)}
                  >
                    <div className="ao-file-icon-container">
                      <div className="ao-file-icon">
                        {file.type === "notebook" && <FaStickyNote />}

                        {file.type === "handwritten" &&
                          (file.fileType === "pdf" ? (
                            <FaFilePdf />
                          ) : (
                            <FaImage />
                          ))}

                        {file.type === "pdf" && <FaFilePdf />}

                        {file.type === "image" && <FaImage />}
                      </div>
                      {/* <button
                        className="ao-file-action-btn active"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleImportant(file);
                        }}
                      >
                        <FaStar />
                      </button> */}
                    </div>
                    <div className="ao-file-name">
                      {file.type === "notebook"
                        ? file.name
                        : file.title || file.name}
                    </div>
                  </div>
                ))}

              {allFiles.filter((f) => f.important).length === 0 && (
                <div className="ao-empty-state">
                  No important files marked yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "shared" && (
          <div className="ao-shared-files">
            {/* <div className="ao-shared-header">
              <h3>Shared Notebooks</h3>
              <button
                className="ao-refresh-btn"
                onClick={fetchSharedNotebooks}
                disabled={sharedLoading}
              >
                {sharedLoading ? "Loading..." : "Refresh"}
              </button>
            </div> */}

            {sharedLoading ? (
              <div className="ao-loading-container">
                <SquaresLoader />
              </div>
            ) : sharedError ? (
              <div className="ao-error-container">
                <p>{sharedError}</p>
                <button onClick={fetchSharedNotebooks}>Try Again</button>
              </div>
            ) : (
              <div className="shared-notebooks-grid">
                {sharedNotebooks.map((sharedItem) => (
                  <div
                    key={sharedItem.shareId}
                    className="shared-notebook-card"
                  >
                    <div className="shared-card-header">
                      <div className="ao-file-icon-container-share">
                                           {sharedItem.isActive && (
                          <div className="share-indicator">
                            <FaGlobe />
                          </div>
                        )}
                        <div className="file-icon-1">
                          {sharedItem.type === "notebook" ? (
                            <FaStickyNote />
                          ) : sharedItem.type === "pdf" ? (
                            <FaFilePdf />
                          ) : (
                            <FaImage />
                          )}
                        </div>
                        {/* Show globe icon only if isActive */}
     
                      </div>

                      <div className="shared-actions">
                        <div
                          className={`share-status ${
                            sharedItem.isActive ? "active" : "inactive"
                          }`}
                        >
                          {sharedItem.isActive ? "Active" : "Inactive"}
                        </div>
                        <button
                          className="action-btn-1 revoke-btn-1"
                          onClick={() => handleRevokeShare(sharedItem.shareId)}
                          title="Revoke share"
                        >
                          <FaUnlink />
                        </button>
                      </div>
                    </div>

                    <div className="shared-card-content">
                      <div className="shared-file-name-2">
                        {sharedItem.title || "Untitled"}
                      </div>

                      <div className="shared-stats">
                        <div className="stat-item">
                          <FaEye />
                          <span>{sharedItem.viewCount || 0} views</span>
                        </div>
                        <div className="stat-item">
                          <FaClock />
                          <span>
                            Shared{" "}
                            {new Date(
                              sharedItem.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="share-link-preview">
                        <div className="link-text">
                          {/* {window.location.origin} */}
                          {frontenedURL}/share/notebook/{sharedItem.shareId}
                        </div>
                        <button
                          className="action-btn-1 copy-link-btn-1"
                          onClick={() =>
                            handleCopyShareLink(
                              `${frontenedURL}/share/notebook/${sharedItem.shareId}`
                            )
                          }
                          title="Copy share link"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sharedNotebooks.length === 0 && (
                  <div className="ao-empty-state">
                    <div className="ao-empty-icon">
                      <FaShare />
                    </div>
                    <h3>No Shared Notebooks</h3>
                    <p>
                      You haven't shared any notebooks yet. Share a notebook to
                      see it here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* <div className="file-manager-container"> */}
        {activeTab === "notes" && selectedFile ? (
          <div className="ao-file-content-container">
            <div className="ao-file-header">
              {/* <h3>{selectedFile.name || selectedFile.title}</h3> */}
              <button className="ao-close-btn" onClick={handleCloseFile}>
                <FaTimes />
              </button>
            </div>
            <div className="ao-file-content">
              {selectedFile.type === "handwritten" ? (
                <div className="pdf-preview">
                  {selectedFile.fileUrl ? (
                    <ModernPDFViewer
                      fileId={selectedFile._id}
                      fileUrl={selectedFile.fileUrl}
                      fileName={selectedFile.title}
                      type="handwritten"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <div className="ao-preview-icon">📄</div>
                      <p>Loading PDF preview...</p>
                    </div>
                  )}
                </div>
              ) : selectedFile.type === "image" ? (
                <div className="ao-image-preview">
                  <div className="ao-placeholder-image" />
                </div>
              ) : selectedFile.type === "notebook" ? (
                <div className="ao-notebook-preview">
                  <Notebook
                    notebookId={selectedFile._id}
                    notebookName={selectedFile.name}
                    file={selectedFile}
                    onRename={handleRename}
                    onToggleImportant={handleToggleImportant}
                    OnDelete={(file) =>
                      setDeleteTarget({
                        mode: "file",
                        file,
                        fileType: "notebook",
                        name: file.title || file.name,
                      })
                    }
                    onExit={exitToListView}
                    onShareLinkGenerated={handleShareLinkGenerated}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          activeTab === "notes" && (
            <div className="ao-content-area">
              <div className="ao-files-section">
                <div className="ao-section-header">
                  <h2 className="ao-section-title">My Files</h2>
                  <div className="ao-section-actions">
                    <span className="ao-total-files">
                      {getAllFiles().length} items
                    </span>
                  </div>
                </div>

                <div className="ao-files-content-wrapper">
                  {fileLoading && (
                    <div className="ao-fileloader-overlay">
                      <SquaresLoader />
                    </div>
                  )}

                  {error && (
                    <div className="ao-error">
                      <strong>⚠️ Error:</strong> {error}
                    </div>
                  )}

                  <div className="ao-files-grid">
                    {/* Notebook Files */}
                    {materials.notebooks?.map((notebook) => (
                      <div
                        key={notebook._id}
                        className="ao-file-card"
                        onClick={() =>
                          handleFileClick({
                            ...notebook,
                            type: "notebook",
                            note_id: notebook._id,
                          })
                        }
                        onContextMenu={(e) =>
                          handleContextMenu(e, "file", {
                            ...notebook,
                            type: "notebook",
                          })
                        }
                      > <button
                            className={`ao-file-action-btn ${
                              notebook.important ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleImportant(notebook, "notebook");
                            }}
                            title={
                              notebook.important
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <FaStar />
                          </button>
                        <div className="ao-file-icon-container">
                          <div className="ao-file-icon">
                            <FaStickyNote />
                          </div>
                         
                        </div>

                        <div className="file-details">
                          <div className="ao-file-meta">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="icon icon-tabler icons-tabler-filled icon-tabler-calendar-month"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M8 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M12 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M16 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
                            </svg>
                            <span className="ao-file-date">
                              {/* {notebook.createdAt.toLocaleDateString()} */}
                              {new Date(
                                notebook.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="ao-file-name" title={notebook.name}>
                            {notebook.name}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Handwritten Notes */}
                    {materials.handwrittenNotes?.map((note) => (
                      <div
                        key={note._id}
                        className="ao-file-card"
                        onClick={() =>
                          handleFileClick({
                            ...note,
                            type: "handwritten",
                            fileType: note.fileType,
                          })
                        }
                        onContextMenu={(e) =>
                          handleContextMenu(e, "file", {
                            ...note,
                            type: "handwritten",
                          })
                        }
                      >
                            <button
                            className={`ao-file-action-btn ${
                              note.important ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleImportant(note, "handwritten");
                            }}
                            title={
                              note.important
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <FaStar />
                          </button>
                        <div className="ao-file-icon-container">
                          <div className="ao-file-icon">
                            {note.fileType === "pdf" ? (
                              <FaFilePdf />
                            ) : (
                              <FaImage />
                            )}
                          </div>
                      
                        </div>

                        <div className="file-details">
                          <div className="ao-file-meta">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="icon icon-tabler icons-tabler-filled icon-tabler-calendar-month"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M8 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M12 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M16 12a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1" />
                              <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
                            </svg>
                            <span className="ao-file-date">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            {/* {note.fileType && (
                            <>
                              <span className="file-type-badge">
                                {note.fileType.toUpperCase()}
                              </span>
                            </>
                          )} */}
                          </div>
                          <div className="ao-file-name" title={note.title}>
                            {note.title}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {getAllFiles().length === 0 && !fileLoading && (
                      <div className="ao-empty-state">
                        {searchTerm
                          ? `No files match "${searchTerm}"`
                          : "Select a Folder !"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
        {/* </div> */}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {/* CREATE NEW under this folder */}
          {contextMenu.type === "year" && (
            <button
              className="context-menu-item"
              onClick={() => {
                setCreatingType(`subject:${contextMenu.item._id}`);
                setContextMenu(null);
              }}
            >
              <FaPlus /> New Subject
            </button>
          )}

          {contextMenu.type === "subject" && (
            <button
              className="context-menu-item"
              onClick={() => {
                setCreatingType(`chapter:${contextMenu.item._id}`);
                setContextMenu(null);
              }}
            >
              <FaPlus /> New Chapter
            </button>
          )}

          {contextMenu.type === "chapter" && (
            <button
              className="context-menu-item"
              onClick={() => {
                setShowNewModal(true);
                setContextMenu(null);
              }}
            >
              <FaPlus /> New File / Note
            </button>
          )}

          <button
            className="context-menu-item"
            onClick={() => {
              setRenaming(contextMenu);
              setContextMenu(null);
            }}
          >
            <FaEdit /> Rename
          </button>

          <button
            className="context-menu-item"
            onClick={() => {
              if (contextMenu.type === "file") {
                handleToggleImportant(contextMenu.item, contextMenu.item.type);
              } else if (contextMenu.type === "year") {
                handleToggleImportantYear(contextMenu.item._id);
              } else if (contextMenu.type === "subject") {
                handleToggleImportantSubject(contextMenu.item._id);
              } else if (contextMenu.type === "chapter") {
                handleToggleImportantChapter(contextMenu.item._id);
              }
              setContextMenu(null);
            }}
          >
            {contextMenu.item.important == false ? (
              <>
                <FaStar /> Mark Important
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-star-off"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 3l18 18" />
                  <path d="M10.012 6.016l1.981 -4.014l3.086 6.253l6.9 1l-4.421 4.304m.012 4.01l.588 3.426l-6.158 -3.245l-6.172 3.245l1.179 -6.873l-5 -4.867l6.327 -.917" />
                </svg>{" "}
                Unmark Important
              </>
            )}
          </button>

          <button
            className="context-menu-item delete"
            onClick={() => {
              if (contextMenu.type === "file") {
                setDeleteTarget({
                  mode: "file",
                  file: contextMenu.item,
                  fileType: contextMenu.item.type,
                  name: contextMenu.item.name || contextMenu.item.title,
                });
              } else {
                const id = contextMenu.item._id;
                const name =
                  contextMenu.type === "year"
                    ? contextMenu.item.title
                    : contextMenu.type === "subject"
                    ? contextMenu.item.name
                    : contextMenu.item.title;
                setDeleteTarget({
                  mode: "item",
                  type: contextMenu.type,
                  id,
                  name,
                });
              }
              setContextMenu(null);
            }}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}

      {/* Rename Prompt */}
      {renaming && (
        <RenamePrompt
          currentName={
            renaming.type === "year"
              ? renaming.item.title
              : renaming.type === "subject"
              ? renaming.item.name
              : renaming.type === "chapter"
              ? renaming.item.title
              : renaming.type === "file" && renaming.item.type === "notebook"
              ? renaming.item.name
              : renaming.item.title || renaming.item.name
          }
          onRename={async (newName) => {
            if (renaming.type === "year") {
              await renameYear(renaming.item._id, newName);
            } else if (renaming.type === "subject") {
              await renameSubject(renaming.item._id, newName);
            } else if (renaming.type === "chapter") {
              await renameChapter(renaming.item._id, newName);
            } else if (renaming.type === "file") {
              await handleRename(renaming.item, renaming.item.type, newName); // pass newName here
            }
            setRenaming(null);
          }}
          onCancel={() => setRenaming(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="ao-delete-modal-container">
          <div className="ao-delete-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="ao-modal-actions">
              <button onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="ao-delete-btn"
                onClick={async () => {
                  // call the correct handler based on mode
                  if (deleteTarget.mode === "item") {
                    await handleDeleteItem(deleteTarget.type, deleteTarget.id);
                  } else {
                    await handleDeleteFile(
                      deleteTarget.file,
                      deleteTarget.fileType
                    );
                  }
                  setDeleteTarget(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicOrganizer;