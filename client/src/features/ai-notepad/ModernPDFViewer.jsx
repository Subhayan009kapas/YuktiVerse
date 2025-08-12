import React, { useState , useRef} from 'react';
import { FileText, ExternalLink, Download, ZoomIn, ZoomOut, Maximize2, Eye } from 'lucide-react';
import './ModernPDFViewer.css'
import ShareButton from '../academic-notebook/ShareButton';

const ModernPDFViewer = ({ 
  fileId , 
  fileUrl,
  fileName,
  type = 'handwritten'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleViewExternal = () => {
    window.open(fileUrl, '_blank');
  };
    const iframeRef = useRef(null);
  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe && iframe.webkitRequestFullscreen) { // Safari
      iframe.webkitRequestFullscreen();
    } else if (iframe && iframe.mozRequestFullScreen) { // Firefox
      iframe.mozRequestFullScreen();
    } else if (iframe && iframe.msRequestFullscreen) { // IE/Edge
      iframe.msRequestFullscreen();
    }
  };
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-wrapper">
        {/* Main Content */}
        <div className={`file-content-2 ${isFullscreen ? 'fullscreen' : ''}`}>
          {type === 'handwritten' ? (
            <div className="pdf-preview">
              {/* Toolbar */}
              <div className="toolbar">
                <div className="toolbar-section">
                  <div className="file-info">
                    <FileText className="file-icon-2" />
                    <span className="file-name">{fileName}</span>
                  </div>
                </div>
                
                <div className="toolbar-section">
                  {/* <div className="zoom-controls">
                    <button 
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                      className="toolbar-btn"
                      disabled={zoom <= 25}
                    >
                      <ZoomOut className="btn-icon" />
                    </button>
                    <span className="zoom-display">{zoom}%</span>
                    <button 
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      className="toolbar-btn"
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="btn-icon" />
                    </button>
                  </div> */}
                  <ShareButton notebookId={fileId} type ={'handwritten'}/>
                  <div className="action-buttons">
                    <button onClick={handleFullscreen} className="toolbar-btn" title="Fullscreen">
                      <Maximize2 className="btn-icon" />
                    </button>
                    <button onClick={handleViewExternal} className="toolbar-btn" title="Open in new tab">
                      <ExternalLink className="btn-icon" />
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="pdf-container">
                {fileUrl ? (
                  <div className="pdf-wrapper" style={{ transform: `scale(${zoom / 100})` }}>
                    <embed 
                      ref={iframeRef}
                      src={fileUrl} 
                      width="100%" 
                      height="800px"
                      title="PDF Viewer"
                      className="pdf-embed"
                    />
                    
                    {/* Overlay for enhanced styling */}
                    <div className="pdf-overlay">
                      <div className="loading-shimmer"></div>
                    </div>
                  </div>
                ) : (
                  <div className="pdf-placeholder">
                    <FileText className="placeholder-icon" />
                    <h3 className="placeholder-title">No Document Selected</h3>
                    <p className="placeholder-text">Upload a PDF to start viewing</p>
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              {/* <div className="quick-actions">
                <button onClick={handleViewExternal} className="quick-action-btn primary">
                  <Eye className="btn-icon" />
                  View Original
                </button>
                <button onClick={handleDownload} className="quick-action-btn secondary">
                  <Download className="btn-icon" />
                  Download
                </button>
              </div> */}
            </div>
          ) : type === 'image' ? (
            <div className="image-preview">
              <div className="placeholder-image">
                <div className="image-icon-wrapper">
                  <Eye className="image-icon" />
                </div>
                <h3 className="placeholder-title">Image Preview</h3>
                <p className="placeholder-text">Image content would be displayed here</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ModernPDFViewer;