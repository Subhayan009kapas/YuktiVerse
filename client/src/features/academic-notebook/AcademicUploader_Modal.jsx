// AcademicUploader_Modal.jsx
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
import "./AcademicUploader_Modal.css";
import { toast } from "react-toastify";

export default function AcademicUploader_Modal({
  onClose,
  // onUploadFile,
  onFilesUploaded,
  onCreateNotebook,
  // oncreated,
  selectedChapterId,
}) {
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  // const [showModal, setShowModal] = useState(true);
  const [notebookName, setNotebookName] = useState("");
  const [textBoxes, setTextBoxes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const token = localStorage.getItem("token");
  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const handleBatchUpload = async (filesToUpload) => {
    console.log("Uploading batch of files:", filesToUpload);
    // Assuming onFilesUploaded can handle an array or you can loop here
    // For now, let's pass them one-by-one using the existing prop
    for (const fileData of filesToUpload) {
      // The parent's prop is onFilesUploaded(file, title)
      await onFilesUploaded(fileData.file, fileData.name);
    }
    toast.success(`${filesToUpload.length} file(s) uploaded successfully!`);
  };

  const createNotebook = async () => {
    if (!notebookName.trim()) {
      toast.warning("Enter a name");
      return;
    }
    if (!selectedChapterId) {
      toast.warning("Please Select Chapter");
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
      // setTextBoxes([]);

      toast.success("Notebook Created");
      setShowNotebookForm(false);
      // setShowModal(false);
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

  // const handleFileUpload = (file, title) => {
  //   // onUploadFile(file, title );
  //   onFilesUploaded(file, title);
  //   handleClose();
  // };

  return (
    <>
      {/* {showModal && ( */}
        <div
          className={`acd-modal-backdrop ${isVisible ? "acd-visible" : ""} ${
            isClosing ? "acd-closing" : ""
          }`}
          onClick={() => !showUploader && handleClose()}
        >
          <div
            className={`acd-modal ${isVisible ? "acd-visible" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {!showUploader && (
              <button className="acd-close-btn-mod" onClick={handleClose}>
                <FaTimes />
              </button>
            )}

            <div className="acd-modal-header"></div>

            <div className="acd-modal-actions">
              {/* <label className="action-card upload-card image"> */}
              <button
                className="acd-action-card acd-upload-card"
                onClick={() => setShowUploader(true)}
              >
                <div className="acd-card-icon">
                  <FaUpload />
                </div>
                <div className="acd-card-content">
                  <h4>Advanced Uploader</h4>
                  <p>Use the drag & drop uploader</p>
                </div>
                <div className="acd-card-arrow">→</div>
              </button>

              <button
                className="acd-action-card acd-notebook-card"
                onClick={() => setShowNotebookForm(true)}
              >
                <div className="acd-card-icon">
                  <FaStickyNote />
                </div>
                <div className="acd-card-content">
                  <h4>New Notebook</h4>
                  <p>Create a blank notebook</p>
                </div>
                <div className="acd-card-arrow">→</div>
              </button>
            </div>
          </div>

          {/* Notebook Form Modal */}
          {showNotebookForm && (
            <div
              className={`acd-modal-overlay acd-notebook-form-overlay ${
                showNotebookForm ? "acd-visible" : ""
              }`}
              onClick={() => setShowNotebookForm(false)}
            >
              <div
                className="acd-modal-content acd-notebook-form"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="acd-close-btn-mod"
                  onClick={() => setShowNotebookForm(false)}
                >
                  <FaTimes />
                </button>

                <div className="acd-form-content">
                  <div className="acd-input-group">
                    <label>Notebook Name</label>
                    <input
                      type="text"
                      placeholder="Enter notebook name..."
                      value={notebookName}
                      onChange={(e) => setNotebookName(e.target.value)}
                      autoFocus
                      className="acd-modern-input"
                    />
                  </div>

                  <div className="acd-form-actions">
                    <button
                      className="acd-btn-secondary"
                      onClick={() => setShowNotebookForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="acd-btn-primary"
                      onClick={createNotebook}
                      disabled={!notebookName.trim() || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="acd-spinner"></div>
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
              onFilesUploaded={handleBatchUpload}
              onClose={() => {
                setShowUploader(false); // Hide the uploader
                handleClose(); // Close the main modal
              }}
            />
          )}
        </div>
    </>
  );
}