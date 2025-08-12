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
import "./AcademicOrganizer.css";
import NewModal from "./NewModal";
import RenamePrompt from "./RenamePrompt";
import Notebook from "../ai-notepad/Notebook";
import ModernPDFViewer from "../ai-notepad/ModernPDFViewer";
import axios from "axios";
import {
  DotsLoader,
  RingLoader,
  SquaresLoader,
  BarsLoader,
  OrbitLoader,
  ProgressLoader,
  HexagonLoader,
  OverlayLoader,
  InlineLoader,
  SmartLoader,
  useLoader,
  withLoading,
  LoaderShowcase,
} from "../../components/Loader";
import AiHelpers from "../ai-notepad/AiHelpers";
import { toast } from "react-toastify";

const STORAGE_KEY = "academicOrganizerData";
let userId = `689a5aa50e84378e6eb70ff2`;
localStorage.setItem(
  "token",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWE1YWE1MGU4NDM3OGU2ZWI3MGZmMiIsImlhdCI6MTc1NDk3ODI4MiwiZXhwIjoxNzU1MDY0NjgyfQ.W26PqBwsSHK2TEkxBk2ah0xkd_kT9W2P1GmLMdSNq0c"
);
// const token = localStorage.getItem('token');
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

  const [moving, setMoving] = useState(null);
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
  // const [notebookName, setNotebookName] = useState('');
  // const [textBoxes, setTextBoxes] = useState([]);
  // const [isSaving, setIsSaving] = useState(false);

  const [chatActive, setChatActive] = useState(false);
  const panelRef = useRef(null);

  // inside AcademicOrganizer, just below your useState declarations:
  const persistAllFiles = (newFiles) => {
    console.log("[Cache] Persisting", newFiles.length, "files to localStorage");
    setAllFiles(newFiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
  };

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      console.log(
        "[Cache] Found saved files, loading",
        JSON.parse(cached).length,
        "items"
      );
      persistAllFiles(JSON.parse(cached));
      setAllFilesFetched(true);
    } else {
      console.log("[Cache] No cache found, fetching from server");
      fetchAllFiles(); // fetchAllFiles itself will call persistAllFiles
    }
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

  const [allFiles, setAllFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        console.log(token);

        const res = await axios.get(`${backendURL}/years`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setYears(res.data);
      } catch (err) {
        console.error("Error fetching years:", err);
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
  const [subjectsLoading, setSubjectsLoading] = useState(false);
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
  const [chaptersLoading, setChaptersLoading] = useState(false);
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

  // shareing relaetd
  const fetchSharedNotebooks = async () => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await axios.get(
        `${backendURL}/api/share/user/notebooks/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // const response = await axios.get("/api/share/user/notebooks" ,{
      //   email: "ab@gmail.com",
      //   id : "689738740562829489a60a41",
      //   password: "password123"
      // });
      console.log(response);

      setSharedNotebooks(response.data);
    } catch (err) {
      console.error("Error fetching shared notebooks:", err);
      setSharedError("Failed to load shared notebooks");
    } finally {
      setSharedLoading(false);
    }
  };
  const handleShareLinkGenerated = () => {
    fetchSharedNotebooks(); // reload shared notebooks on new share link
  };

  const handleRevokeShare = async (shareId) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this share link? People with this link will no longer be able to access the notebook."
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${backendURL}/api/share/notebook/${userId}/${shareId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      setLoading(true);
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
          setLoading(false);
          setFileLoading(false);
        });
    }
  }, [selectedChapterId]);

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

  const [fileLoading, setFileLoading] = useState(false);
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
        setNotebookContent(res.data);
        // setFileLoading(false);
        setViewerType("notebook");
      } catch (err) {
        console.error("Error loading notebook:", err);
      } finally {
        // setFileLoading(false);
      }
    } else if (file.type === "handwritten") {
      setViewerType("pdf"); // we'll use file.fileUrl to view this
    } else {
      console.warn("Unknown file type");
    }
  };

  // Handle closing file view
  const handleCloseFile = () => {
    setSelectedFile(null);
    setFileLoading(null);
  };

  const handleCreateYear = async (title) => {
    try {
      const res = await axios.post(`${backendURL}/years`, {
        title,
        important: false,
      });
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

      await axios.patch(`${backendURL}/years/rename/${yearId}`, {
        title: newTitle,
      });
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
    // if (
    //   !window.confirm(
    //     "Are you sure you want to delete this item and all its contents?"
    //   )
    // )
    //   return;
    setDeleteTarget(true);
    try {
      if (type === "year") {
        await axios.delete(`${backendURL}/years/${id}`);
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
        await axios.delete(`${backendURL}/years/subjects/${id}`);
        setSubjects((prev) => prev.filter((s) => s._id !== id));

        if (selectedSubjectId === id) {
          setSelectedSubjectId(null);
          setChapters([]);
          setSelectedChapterId(null);
          setMaterials({ notebooks: [], handwrittenNotes: [] });
        }
      } else if (type === "chapter") {
        await axios.delete(`${backendURL}/years/subjects/chapters/${id}`);
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

      await axios.patch(`${backendURL}/years/subjects/rename/${subjectId}`, {
        name: newName,
      });
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
        { chapterTitle } // ✅ correct key
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
        `${backendURL}years/subjects/chapters/${chapterId}`,
        {
          important: !chapter.important,
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
    // console.log("coming");

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

  const [isFetchingAllFiles, setIsFetchingAllFiles] = useState(false);
  const [allFilesFetched, setAllFilesFetched] = useState(false);
  const [fetchAllFilesError, setFetchAllFilesError] = useState(null);

  const fetchAllFiles = async () => {
    if (allFilesFetched) return;
    setIsFetchingAllFiles(true);
    setFetchAllFilesError(null);
    setFilesLoading(true);
    try {
      const allFilesData = [];

      const yearsRes = await axios.get(`${backendURL}/years`);
      const years = yearsRes.data;

      for (const year of years) {
        const subjectsRes = await axios.get(
          `${backendURL}/years/${year._id}/subjects`
        );
        const subjects = subjectsRes.data;

        for (const subject of subjects) {
          const chaptersRes = await axios.get(
            `${backendURL}/years/subjects/${subject._id}/chapters`
          );
          const chapters = chaptersRes.data;

          for (const chapter of chapters) {
            try {
              const materialsRes = await axios.get(
                `${backendURL}/years/${chapter._id}/materials`
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
                    searchableText: notebook.name.toLowerCase(), // for easier searching
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
                    searchableText: note.title.toLowerCase(), // for easier searching
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

      console.log(`Loaded ${allFilesData.length} files for search`);
      setAllFiles(allFilesData);
      setAllFilesFetched(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFilesData));
    } catch (err) {
      console.error("Error fetching all files:", err);
      setFetchAllFilesError("Failed to fetch all files.");
    } finally {
      setFilesLoading(false);
      setIsFetchingAllFiles(false);
    }
  };
  useEffect(() => {
    if (
      showSearchResults &&
      searchTerm.trim() !== "" &&
      !allFilesFetched &&
      !isFetchingAllFiles
    ) {
      fetchAllFiles();
    }
  }, [showSearchResults, searchTerm, allFilesFetched, isFetchingAllFiles]);

  const [yearsLoading, setYearsLoading] = useState(true);
  useEffect(() => {
    const fetchYears = async () => {
      try {
        setYearsLoading(true);
        const res = await axios.get(`${backendURL}/years`);
        setYears(res.data);

        // After years are loaded, fetch all files for search
        fetchAllFiles();
      } catch (err) {
        console.error("Error fetching years:", err);
      } finally {
        setYearsLoading(false);
      }
    };
    fetchYears();
  }, []);
  const updateAllFilesCache = (
    chapterId,
    updatedMaterials,
    yearTitle,
    subjectName,
    chapterTitle,
    yearId,
    subjectId
  ) => {
    setAllFiles((prevFiles) => {
      prevFiles.map((f) =>
        f._id === f._id ? { ...f, important: !f.important } : f
      );
      // Re old files from this chapter
      const filteredFiles = prevFiles.filter(
        (file) => file.chapterId !== chapterId
      );

      // Add updated files
      const newFiles = [];

      // Add notebooks
      if (updatedMaterials.notebooks) {
        updatedMaterials.notebooks.forEach((notebook) => {
          newFiles.push({
            ...notebook,
            type: "notebook",
            yearId,
            yearTitle,
            subjectId,
            subjectName,
            chapterId,
            chapterTitle,
            fullPath: `${yearTitle} / ${subjectName} / ${chapterTitle}`,
            searchableText: notebook.name.toLowerCase(),
          });
        });
      }

      // Add handwritten notes
      if (updatedMaterials.handwrittenNotes) {
        updatedMaterials.handwrittenNotes.forEach((note) => {
          newFiles.push({
            ...note,
            type: "handwritten",
            yearId,
            yearTitle,
            subjectId,
            subjectName,
            chapterId,
            chapterTitle,
            fullPath: `${yearTitle} / ${subjectName} / ${chapterTitle}`,
            searchableText: note.title.toLowerCase(),
          });
        });
      }

      const merged = [...filteredFiles, ...newFiles];
      console.log(
        `[Cache] Updating cache for chapter ${chapterId}: now ${merged.length} total files`
      );
      persistAllFiles(merged);
      return merged;

      return [...filteredFiles, ...newFiles];
    });
  };

  // Update the existing materials fetch effect to also update the cache
  useEffect(() => {
    if (selectedChapterId) {
      // setLoading(true);
      setFileLoading(true);
      // setFileLoading(false)
      setError(null);
      axios
        .get(`${backendURL}/years/${selectedChapterId}/materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setMaterials(res.data);

          // Update the all files cache
          const yearTitle =
            years.find((y) => y._id === selectedYearId)?.title || "";
          const subjectName =
            subjects.find((s) => s._id === selectedSubjectId)?.name || "";
          const chapterTitle =
            chapters.find((c) => c._id === selectedChapterId)?.title || "";

          updateAllFilesCache(
            selectedChapterId,
            res.data,
            yearTitle,
            subjectName,
            chapterTitle,
            selectedYearId,
            selectedSubjectId
          );
        })
        .catch((err) => {
          console.error("Error fetching materials:", err);
          setError("Failed to load materials");
        })
        .finally(() => {
          // setLoading(false) ;
          setFileLoading(false);
        });
    }
  }, [
    selectedChapterId,
    selectedYearId,
    selectedSubjectId,
    years,
    subjects,
    chapters,
  ]);

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
  const loadChapterAndOpenFile = async (file) => {
    try {
      // If we're not in the right chapter context, navigate there first
      if (selectedChapterId !== file.chapterId) {
        // Set the hierarchy
        setSelectedYearId(file.yearId);
        setSelectedYear(file.yearTitle);
        setSelectedSubjectId(file.subjectId);
        setSelectedSubject(file.subjectName);
        setSelectedChapterId(file.chapterId);
        setSelectedChapter(file.chapterTitle);

        // Wait a bit for the materials to load, then open the file
        setTimeout(() => {
          handleFileClick(file);
        }, 300);
      } else {
        // Already in the right context, just open the file
        handleFileClick(file);
      }
    } catch (err) {
      console.error("Failed to navigate to file:", err);
    }
  };

  // Functions to update cache when files are created/deleted/renamed
  // const addFileToCache = (newFile, type) => {
  //   const yearTitle = years.find(y => y._id === selectedYearId)?.title || '';
  //   const subjectName = subjects.find(s => s._id === selectedSubjectId)?.name || '';
  //   const chapterTitle = chapters.find(c => c._id === selectedChapterId)?.title || '';

  //   const fileWithContext = {
  //     ...newFile,
  //     type,
  //     yearId: selectedYearId,
  //     yearTitle,
  //     subjectId: selectedSubjectId,
  //     subjectName,
  //     chapterId: selectedChapterId,
  //     chapterTitle,
  //     fullPath: `${yearTitle} / ${subjectName} / ${chapterTitle}`,
  //     searchableText: (type === 'notebook' ? newFile.name : newFile.title).toLowerCase()
  //   };

  //   setAllFiles(prev => [...prev, fileWithContext]);
  // };

  // const removeFileFromCache = (fileId) => {
  //   setAllFiles(prev => prev.filter(file => file._id !== fileId));
  // };

  // const updateFileInCache = (fileId, updates) => {
  //   setAllFiles(prev => prev.map(file => {
  //     if (file._id === fileId) {
  //       const updatedFile = { ...file, ...updates };
  //       // Update searchable text if name/title changed
  //       if (updates.name || updates.title) {
  //         updatedFile.searchableText = (updates.name || updates.title).toLowerCase();
  //       }
  //       return updatedFile;
  //     }
  //     return file;
  //   }));
  // };

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
      toast.success("Upload successful!", {
        theme: "colored",
      });
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
      <div className="top-nav">
        <div className="nav-left">
          <button
            className="nav-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="app-name">YuktiVerse</div>
        </div>

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
        {/* chatbot */}
        <>
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

          {chatActive && (
            <div ref={panelRef}>
              <AiHelpers
                text="Hi"
                onClose={() => setChatActive(false)} // ✅ Pass close handler
                mode="chatbot"
              />
            </div>
          )}
        </>

        <div className="global-search-container">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              className="global-search-bar"
              placeholder="Search all files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
          </div>

          {showSearchResults && searchTerm.trim() !== "" && (
            <div className="global-search-results">
              {isFetchingAllFiles ? (
                <SquaresLoader />
              ) : fetchAllFilesError ? (
                <div className="error">{fetchAllFilesError}</div>
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
                      <div className="search-result-path">{file.fullPath}</div>
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

      {/* Sidebar */}
      <div className={`ao-sidebar ${sidebarOpen ? "open" : ""}`}>
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
                  {selectedYearId === year._id ? (
                    <FaFolderOpen className="ao-icon" />
                  ) : (
                    <FaFolder className="ao-icon" />
                  )}
                  {year.title}
                  {year.important && <FaStar className="important-star" />}
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
                              selectedSubjectId === subject._id ? "active" : ""
                            }`}
                            onClick={() => handleSubjectClick(subject._id)}
                            onContextMenu={(e) =>
                              handleContextMenu(e, "subject", subject)
                            }
                          >
                            {selectedSubjectId === subject._id ? (
                              <FaFolderOpen className="ao-icon" />
                            ) : (
                              <FaFolder className="ao-icon" />
                            )}
                            {subject.name}
                            {subject.important && (
                              <FaStar className="important-star" />
                            )}
                          </button>

                          {selectedSubjectId === subject._id && (
                            <div className="ao-subsection">
                              {chaptersLoading ? (
                                <div
                                  style={{ padding: "8px", marginLeft: "40px" }}
                                >
                                  <InlineLoader type="dots" text="" />
                                </div>
                              ) : (
                                chapters.map((chapter) => (
                                  <div key={chapter._id} className="ao-subitem">
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
                                        handleContextMenu(e, "chapter", chapter)
                                      }
                                    >
                                      {selectedChapterId === chapter._id ? (
                                        <FaFolderOpen className="ao-icon" />
                                      ) : (
                                        <FaFolder className="ao-icon" />
                                      )}
                                      {chapter.title}
                                      {chapter.important && (
                                        <FaStar className="important-star" />
                                      )}
                                    </button>
                                  </div>
                                ))
                              )}

                              {/* Create Chapter Button */}
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
                                    <FaPlus /> New Chapter
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {/* Create Subject Button */}
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

          {/* Create Year Button */}
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

      {/* Main Content */}
      <div className="ao-main">
        <div className="main-header">
          <div className="breadcrumb-stepper">
            {getSteps().map((step, index, arr) => (
              <div
                key={index}
                className={`breadcrumb-step ${
                  step.completed ? "completed" : "current"
                } ${index === arr.length - 1 ? "last" : ""}`}
              >
                <span className="label">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="actions">
            <button
              className="action-btn-1"
              onClick={() => {
                setShowNewModal(true);
                console.log(
                  "clicking and need fixes : after one click to the new notebook , it creates , and disabled "
                );
              }}
            >
              <FaPlus /> New
            </button>

            {uploading && (
              <div className="upload-loader-overlay">
                <SquaresLoader text="Uploading file..." />
              </div>
            )}

            {showNewModal && (
              <NewModal
                onClose={() => setShowNewModal(false)}
                onUploadFile={handleUploadFile}
                onCreateNotebook={(newNotebook) => {
                  setMaterials((prev) => ({
                    ...prev,
                    notebooks: [...prev.notebooks, newNotebook],
                  }));
                }}
                selectedChapterId={selectedChapterId}
              />
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
                  <div className="file-icon">
                    {file.type === "notebook" && <FaStickyNote />}

                    {file.type === "handwritten" &&
                      (file.fileType === "pdf" ? <FaFilePdf /> : <FaImage />)}

                    {file.type === "pdf" && <FaFilePdf />}

                    {file.type === "image" && <FaImage />}
                  </div>

                  <div className="file-info">
                    <div className="file-name">
                      {file.type === "notebook"
                        ? file.name
                        : file.title || file.name}
                    </div>
                    <div className="file-date">Today</div>
                  </div>
                </div>
              ))}
              {recentFiles.length === 0 && (
                <div className="empty-state">No recently accessed files</div>
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
                    <div className="file-icon-container">
                      <div className="file-icon">
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
                      <button
                        className="file-action-btn active"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleImportant(file);
                        }}
                      >
                        <FaStar />
                      </button>
                    </div>
                    <div className="ao-file-name">
                      {file.type === "notebook"
                        ? file.name
                        : file.title || file.name}
                    </div>
                  </div>
                ))}

              {allFiles.filter((f) => f.important).length === 0 && (
                <div className="empty-state">No important files marked yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "shared" && (
          <div className="shared-files">
            <div className="shared-header">
              <h3>Shared Notebooks</h3>
              <button
                className="refresh-btn"
                onClick={fetchSharedNotebooks}
                disabled={sharedLoading}
              >
                {sharedLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {sharedLoading ? (
              <div className="loading-container">
                <SquaresLoader />
              </div>
            ) : sharedError ? (
              <div className="error-container">
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
                      <div className="file-icon-container-1">
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
                        {sharedItem.isActive && (
                          <div className="share-indicator">
                            <FaGlobe />
                          </div>
                        )}
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
                      <div className="shared-file-name">
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
                  <div className="empty-state">
                    <div className="empty-icon">
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
          <div className="file-content-container">
            <div className="file-header">
              <h3>{selectedFile.name || selectedFile.title}</h3>
              <button className="close-btn" onClick={handleCloseFile}>
                <FaTimes />
              </button>
            </div>
            <div className="file-content">
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
                      <div className="preview-icon">📄</div>
                      <p>Loading PDF preview...</p>
                    </div>
                  )}
                </div>
              ) : selectedFile.type === "image" ? (
                <div className="image-preview">
                  <div className="placeholder-image" />
                </div>
              ) : selectedFile.type === "notebook" ? (
                <div className="notebook-preview">
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
            <div className="content-area">
              <div className="files-section">
                <div className="section-header">
                  <h2 className="section-title">My Files</h2>
                  <div className="section-actions">
                    <span className="total-files">
                      {getAllFiles().length} items
                    </span>
                  </div>
                </div>

                <div className="files-content-wrapper">
                  {fileLoading && (
                    <div className="fileloader-overlay">
                      <SquaresLoader />
                    </div>
                  )}

                  {error && (
                    <div className="error">
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
                      >
                        <div className="file-icon-container">
                          <div className="file-icon">
                            <FaStickyNote />
                          </div>
                          <button
                            className={`file-action-btn ${
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
                        <div className="file-icon-container">
                          <div className="file-icon">
                            {note.fileType === "pdf" ? (
                              <FaFilePdf />
                            ) : (
                              <FaImage />
                            )}
                          </div>
                          <button
                            className={`file-action-btn ${
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
                      <div className="empty-state">
                        {searchTerm
                          ? `No files match "${searchTerm}"`
                          : "No files uploaded yet. Start by adding your first file!"}
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

      {/* Move Modal */}
      {/* {moving && (
        <MoveModal
          item={moving}
          onMove={(destination) => {
            // Handle move logic here
            console.log('Moving item:', moving, 'to:', destination);
            setMoving(null);
          }}
          onClose={() => setMoving(null)}
        />
      )} */}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="delete-modal-container">
          <div className="delete-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="delete-btn"
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
