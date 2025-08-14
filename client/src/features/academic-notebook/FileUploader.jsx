import React, { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, FileText, Music, Video } from "lucide-react";
import "./FileUploader.css";

// ADDED: 'onClose' to the component's props
const FileUploader = ({ onFilesUploaded, onClose }) => {
  if (!onFilesUploaded) {
    console.warn("⚠️ onFilesUploaded prop not provided to FileUploader");
  }
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // No changes to the functions here...
  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const droppedFiles = Array.from(e.dataTransfer.files); handleFiles(droppedFiles); }, []);
  const handleFileSelect = useCallback((e) => { const selectedFiles = Array.from(e.target.files); handleFiles(selectedFiles); }, []);
  const handleFiles = (newFiles) => { const processedFiles = newFiles.map((file) => ({ id: Math.random().toString(36).substr(2, 9), file, name: file.name, size: file.size, type: file.type, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null, })); setFiles((prev) => [...prev, ...processedFiles]); };
  const removeFile = (fileId) => { setFiles((prev) => { const fileToRemove = prev.find((f) => f.id === fileId); if (fileToRemove && fileToRemove.preview) { URL.revokeObjectURL(fileToRemove.preview); } return prev.filter((f) => f.id !== fileId); }); };
  const formatFileSize = (bytes) => { if (bytes === 0) return "0 Bytes"; const k = 1024; const sizes = ["Bytes", "KB", "MB", "GB"]; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]; };
  const getFileIcon = (type) => { if (type.startsWith("image/")) return <Image className="w-5 h-5" />; if (type.startsWith("video/")) return <Video className="w-5 h-5" />; if (type.startsWith("audio/")) return <Music className="w-5 h-5" />; if (type.includes("pdf") || type.includes("document")) return <FileText className="w-5 h-5" />; return <File className="w-5 h-5" />; };
  const uploadFiles = async () => { if (files.length === 0) return; setIsUploading(true); const failedUploads = []; for (const fileData of files) { try { await onFilesUploaded([{ file: fileData.file, name: fileData.name }]); } catch (err) { console.error(`❌ Upload failed for: ${fileData.name}`, err); failedUploads.push(fileData.name); } } setIsUploading(false); if (failedUploads.length > 0) { alert(`Failed to upload: ${failedUploads.join(", ")}`); } else { setFiles([]); } };
  const openFileDialog = () => { fileInputRef.current?.click(); };
  const clearAllFiles = () => { files.forEach((file) => { if (file.preview) { URL.revokeObjectURL(file.preview); } }); setFiles([]); };


  return (
    <div className="up-uploader-wrapper">
      <div className="up-uploader-container">
        <div className="up-uploader-content">
          <div className="up-uploader-header">
            <p className="up-uploader-subtitle">Upload Your Files</p>
            
            {/* ADDED: The close button */}
            <button onClick={onClose} className="up-close-btn" type="button">
              <X size={20} />
            </button>

          </div>

          {/* ... rest of the component JSX is unchanged ... */}
          <div
            className={`up-upload-zone ${isDragOver ? "up-drag-over" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="up-upload-icon">
              <Upload size={32} color="white" />
            </div>
            <h3 className="up-upload-zone-title">
              {isDragOver ? "Drop files here" : "Choose files or drag here"}
            </h3>
            <button className="up-browse-btn" type="button">
              Browse Files
            </button>
          </div>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="up-file-input"/>
          {files.length > 0 && (
            <div className="up-files-section">
              <h3 className="up-files-header">Selected Files ({files.length})</h3>
              <div className="up-files-list">
                {files.map((file) => (
                  <div key={file.id} className="up-file-item-2">
                    {file.preview ? (<img src={file.preview} alt={file.name} className="up-file-preview"/>) : (<div className="up-file-icon-container">{getFileIcon(file.type)}</div>)}
                    <div className="up-file-info">
                      <p className="up-file-name">{file.name}</p>
                      <p className="up-file-size">{formatFileSize(file.size)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="up-remove-btn" type="button"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="up-action-buttons">
                <button onClick={uploadFiles} disabled={isUploading} className="up-upload-btn" type="button">
                  {isUploading ? (<><div className="up-loading-spinner"></div>Uploading...</>) : (`Upload ${files.length} file${files.length !== 1 ? "s" : ""}`)}
                </button>
                <button onClick={clearAllFiles} className="up-clear-btn" type="button">Clear All</button>
              </div>
              {isUploading && (<div className="up-progress-container"><div className="up-progress-bar"></div></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;