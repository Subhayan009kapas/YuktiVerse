import React, { useState } from 'react';
import PDFUploader from './PDFUploader';
import PdfSummarizerSidebar from './PdfSummarizerSidebar';
import PdfSummarizerTopbar from './PdfSummarizerTopbar';
import PdfHistory from './PdfHistory'; // ✅ Make sure this component exists
import './Pdf_main.css';
 // ✅ Import your Sidebar component
function Pdf_main() {
  const [activeSection, setActiveSection] = useState('upload');

  return (
    <div className="analyzer-container">
      {/* <Sidebar /> */}
      <PdfSummarizerSidebar
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      <div className="main-content">
        <PdfSummarizerTopbar />
        <div className="content-area">
          {activeSection === 'upload' && <PDFUploader />}
          {activeSection === 'history' && <PdfHistory />}
        </div>
      </div>
    </div>
  );
}

export default Pdf_main;
