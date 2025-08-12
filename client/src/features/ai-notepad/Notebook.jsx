import React, { useState, useRef, useEffect } from "react";
import "./Notebook.css";
import { Rnd } from "react-rnd";
import Popover from "./Popover";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import {
  FaStar,
  FaTrash,
  FaTimes,
  FaEdit,
  FaRobot,
  FaExpand,
} from "react-icons/fa";
import axios from "axios";
import { SquaresLoader } from "../../components/Loader";
import ShareButton from "../academic-notebook/ShareButton";

const Notebook = ({
  notebookId,
  notebookName,
  file,
  onRename,
  onToggleImportant,
  OnDelete,
  onExit,
  onShareLinkGenerated,
}) => {
  const [textBoxes, setTextBoxes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const canvasRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [popoverBoxId, setPopoverBoxId] = useState(null);
  const aiButtonRefs = useRef({});

  const [showMenu, setShowMenu] = useState(false);

  const [isImportant, setIsImportant] = useState(file.important);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState(notebookName);
const token = localStorage.getItem('token');
  useEffect(() => {
    setNewNotebookName(notebookName);
  }, [notebookName]);

  useEffect(() => {
    const loadNotebook = async () => {
      console.log(notebookId);

      try {
        setIsLoading(true);
        if (notebookId) {
          const response = await axios.get(
            `${backendURL}/api/notebooks/${notebookId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          // console.log(response);

          const notebook = response.data;

          if (notebook.content?.textBoxes) {
            setTextBoxes(notebook.content.textBoxes);
          }
        }
      } catch (error) {
        console.error("Error loading notebook:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotebook();
  }, [notebookId]);

  const saveNotebook = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: notebookName, // assume you have this in state
        content: {
          textBoxes: textBoxes, // the current state
        },
      };

      const response = await axios.put(
        `${backendURL}/api/notebooks/${notebookId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Notebook updated:", response.data);
      // Optionally show a toast or UI feedback
    } catch (error) {
      console.error("Error saving notebook:", error);
      // Optionally handle 404 or 500 errors
    } finally {
      setIsSaving(false);
    }
  };
  // Handle rename functionality
  const handleRenameConfirm = async () => {
    try {
      onRename(file, "notebook", newNotebookName);

      setNewNotebookName(newNotebookName);
      setShowMenu(false);
      setIsRenaming(false);
    } catch (error) {
      console.error("Rename failed:", err);
    }
  };

  // Enhanced text box creation
  const handleCanvasClick = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    if (e.target !== canvasRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBox = {
      x,
      y,
      text: "",
      id: `${Date.now()}-${Math.random()}`,
      width: 280, // Increased default width
      height: 120, // Increased default height
      zIndex:
        textBoxes.length > 0
          ? Math.max(...textBoxes.map((b) => b.zIndex)) + 1
          : 1,
    };

    setTextBoxes([...textBoxes, newBox]);
    setActiveId(newBox.id);
  };

  // Enhanced text box rendering with react-rnd
  const renderTextBoxes = () => {
    return textBoxes.map((box) => (
      <Rnd
        key={box.id}
        position={{ x: box.x, y: box.y }}
        size={{ width: box.width, height: box.height }}
        minWidth={200}
        minHeight={100}
        bounds="parent"
        className={`text-box-container ${activeId === box.id ? "active" : ""}`}
        onDragStop={(e, d) => {
          setTextBoxes(
            textBoxes.map((b) =>
              b.id === box.id ? { ...b, x: d.x, y: d.y } : b
            )
          );
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          setTextBoxes(
            textBoxes.map((b) =>
              b.id === box.id
                ? {
                    ...b,
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  }
                : b
            )
          );
        }}
        onMouseDown={() => setActiveId(box.id)}
        style={{ zIndex: box.zIndex }}
        dragHandleClassName="drag-handle"
      >
        <div className="drag-handle">
          <div className="handle-dots">•••</div>
          <div className="text-box-buttons">
            <button
              className="ai-button"
              onClick={(e) => handleAIButton(box.id, e)}
              title="AI Assistant"
              ref={(el) => (aiButtonRefs.current[box.id] = el)}
            >
              <FaRobot />
            </button>
            <button
              className="delete-button-2"
              onClick={(e) => handleDelete(box.id, e)}
              title="Delete note"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <textarea
          className="text-box"
          value={box.text}
          onChange={(e) => handleTextChange(box.id, e)}
          onBlur={() => handleBlur(box.id)}
          placeholder="Type here..."
          style={{ height: "100%" }}
          autoFocus={activeId === box.id}
        />

        {popoverBoxId === box.id && aiButtonRefs.current[box.id] && (
          <Popover
            anchorRef={{ current: aiButtonRefs.current[box.id] }}
            onClose={() => setPopoverBoxId(null)}
            text={box.text}
            textBoxId={box.id}
            notebookId={notebookId}
          />
        )}
      </Rnd>
    ));
  };

  // Handle text changes and auto-resize
  const handleTextChange = (id, e) => {
    const newText = e.target.value;

    setTextBoxes(
      textBoxes.map((box) => {
        if (box.id === id) {
          const textarea = e.target;
          textarea.style.height = "auto";
          const newHeight = Math.max(28, textarea.scrollHeight);

          return {
            ...box,
            text: newText,
            height: newHeight,
          };
        }
        return box;
      })
    );
  };

  // Handle text box deletion
  const handleDelete = (id, e) => {
    e.stopPropagation();
    setTextBoxes(textBoxes.filter((box) => box.id !== id));
  };

  // Handle AI button click
  const handleAIButton = (id, e) => {
    e.stopPropagation();
    console.log("clicked AI on box", id);
    setPopoverBoxId((prev) => (prev === id ? null : id));
  };

  // Handle drag start
  const handleDragStart = (id, e) => {
    if (e.target.classList.contains("drag-handle")) {
      isDragging.current = true;
      setActiveId(id);
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Handle dragging
  const handleDrag = (id, e) => {
    if (!isDragging.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;

    // Boundary checks to keep within canvas
    const boundedX = Math.max(0, Math.min(x, rect.width - 200));
    const boundedY = Math.max(0, Math.min(y, rect.height - 28));

    setTextBoxes(
      textBoxes.map((box) =>
        box.id === id ? { ...box, x: boundedX, y: boundedY } : box
      )
    );
  };

  // Handle drag end
  // const handleDragEnd = () => {
  //   isDragging.current = false;
  // };

  // disappear if no text
  const handleBlur = (id) => {
    const box = textBoxes.find((b) => b.id === id);
    if (box && box.text.trim() === "") {
      setTextBoxes((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Close active text box when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".text-box-container")) {
        setActiveId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Add global mouse move and mouse up listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current && activeId) {
        handleDrag(activeId, e);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeId, textBoxes]);

  // const handleRename = () => {
  //   setShowMenu(false);
  //   // Your rename logic here
  // };

  const handleToggleImportant = () => {
    onToggleImportant(file, "notebook");
    setIsImportant(!isImportant);
  };

  const handleDeleteNote = () => {
    OnDelete(file, "notebook");
    setShowMenu(false);
    // Confirm and delete
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="notebook-container" ref={dropdownRef}>
      {isLoading ? (
        <div className="smart-loader-container">
          <SquaresLoader />
        </div>
      ) : (
        <>
          <div className="notebook-canvas" ref={dropdownRef}>
            <div className="grid-lines"></div>

            <div className="notebook-header" ref={dropdownRef}>
              {isRenaming ? (
                <div className="rename-container">
                  <input
                    type="text"
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    autoFocus
                    className="rename-input"
                  />
                  <button
                    className="confirm-rename"
                    onClick={handleRenameConfirm}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h2>
                  {notebookName}
                  {isImportant && <FaStar className="important-icon" />}
                </h2>
              )}

              <div className="save-controls" ref={dropdownRef}>
                <button className="menu-button">
                  <FaExpand />
                </button>

                <button
                  className="save-button"
                  onClick={saveNotebook}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Notebook"}
                </button>
                <ShareButton
                  notebookId={notebookId}
                  onShareLinkGenerated={onShareLinkGenerated}
                  className="share-notebook-btn"
                />
                <button
                  className={`menu-button ${isImportant ? "important" : ""}`}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  &#8942;
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <button onClick={() => setIsRenaming(true)}>
                      <FaEdit /> Rename
                    </button>
                    <button onClick={handleToggleImportant}>
                      <FaStar />
                      {isImportant ? " Unmark Important" : " Mark Important"}
                    </button>
                    <button onClick={handleDeleteNote}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="canvas" ref={canvasRef} onClick={handleCanvasClick}>
              {renderTextBoxes()}
            </div>
          </div>

          {saveStatus && (
            <div
              className={`save-status ${
                saveStatus.includes("Failed") ? "error" : "success"
              }`}
            >
              {saveStatus}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notebook;
