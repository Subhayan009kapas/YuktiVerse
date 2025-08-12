// NewModal.jsx
import React, { useState, useEffect } from "react";
const backendURL = import.meta.env.VITE_BACKEND_URL;
import {
  FaFilePdf,
  FaImage,
  FaStickyNote,
  FaTimes,
  FaPlus,
  FaUpload,
  // FaSparkles
} from "react-icons/fa";
import FileUploader from "./FileUploader";
import axios from "axios";
import "./NewModal.css";
import { toast } from "react-toastify";

export default function NewModal({
  onClose,
  onUploadFile,
  onFilesUploaded,
  onCreateNotebook,
  // oncreated,
  selectedChapterId,
}) {
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [notebookName, setNotebookName] = useState("");
  const [textBoxes, setTextBoxes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
const token = localStorage.getItem('token');
  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const createNotebook = async () => {
    if (!notebookName.trim()) {
      toast.warning("Enter a Name");
      return;
    }
    if (!selectedChapterId) {
      toast.warning("Enter a Name");
      return;
    }

    const payload = {
      name: notebookName.trim(),
      chapter: selectedChapterId,
      content: { textBoxes },
    };

    setIsSaving(true);
    try {
      const { data: newNotebook } = await axios.post(
        `${backendURL}/api/notebooks/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onCreateNotebook(newNotebook);
      setNotebookName("");
      setTextBoxes([]);

      toast.success("Notebook Created");
      setShowNotebookForm(false);
      setShowModal(false);
    } catch (err) {
      console.error(
        "Failed to create notebook:",
        err.response?.data || err.message
      );
      alert(
        "Could not create notebook: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (file, title) => {
    // onUploadFile(file, title );
    onFilesUploaded(file, title);
    handleClose();
  };

  return (
    <>
      {showModal && (
        <div
          className={`modal-backdrop ${isVisible ? "visible" : ""} ${
            isClosing ? "closing" : ""
          }`}
          onClick={handleClose}
        >
          <div
            className={`modal ${isVisible ? "visible" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn-mod" onClick={handleClose}>
              <FaTimes />
            </button>

            <div className="modal-header"></div>

            <div className="modal-actions">
              {/* <label className="action-card upload-card image"> */}
              <button
                className="action-card upload-card"
                onClick={() => setShowUploader(true)}
              >
                <div className="card-icon">
                  <FaUpload />
                </div>
                <div className="card-content">
                  <h4>Advanced Uploader</h4>
                  <p>Use the drag & drop uploader</p>
                </div>
                <div className="card-arrow">→</div>
              </button>
              {/* 
              <button className="action-card upload-card image">
                <div className="card-icon">
                  <FaImage />
                </div>
                <div className="card-content">
                  <h4>Upload Image</h4>
                  <p>Add images to your collection</p>
                </div>
                <div className="card-arrow">→</div>
                <input
                  type="file"
                  accept="image/*"
                  // accept="application/pdf"
                  hidden
                  onChange={(e) =>
                    handleFileUpload(e.target.files[0], e.target.value)
                  }
                />
              </button> */}
              {/* </label> */}

              <button
                className="action-card notebook-card"
                onClick={() => setShowNotebookForm(true)}
              >
                <div className="card-icon">
                  <FaStickyNote />
                </div>
                <div className="card-content">
                  <h4>New Notebook</h4>
                  <p>Create a blank notebook</p>
                </div>
                <div className="card-arrow">→</div>
              </button>
            </div>
          </div>

          {/* Notebook Form Modal */}
          {showNotebookForm && (
            <div
              className={`modal-overlay notebook-form-overlay ${
                showNotebookForm ? "visible" : ""
              }`}
              onClick={() => setShowNotebookForm(false)}
            >
              <div
                className="modal-content notebook-form"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-btn-mod"
                  onClick={() => setShowNotebookForm(false)}
                >
                  <FaTimes />
                </button>

                <div className="form-content">
                  <div className="input-group">
                    <label>Notebook Name</label>
                    <input
                      type="text"
                      placeholder="Enter notebook name..."
                      value={notebookName}
                      onChange={(e) => setNotebookName(e.target.value)}
                      autoFocus
                      className="modern-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setShowNotebookForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={createNotebook}
                      disabled={!notebookName.trim() || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="spinner"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          Create Notebook
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showUploader && (
            <FileUploader
              onFilesUploaded={(files) => {
                files.forEach((fileData) => {
                  onUploadFile(fileData.file, fileData.name, selectedChapterId); // or use custom title logic
                });
                setShowUploader(false);
                handleClose(); // optionally close modal
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
