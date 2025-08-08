import React, { useState } from "react";
import PDFUploader from "./PDFUploader";
import PdfSummarizerSidebar from "./PdfSummarizerSidebar";
import PdfSummarizerTopbar from "./PdfSummarizerTopbar";
import PdfHistory from "./PdfHistory";
import "./Pdf_main.css";
import Sidebar from "../../components/Sidebar";

function Pdf_main() {
  const [activeSection, setActiveSection] = useState("upload");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="analyzer-container">
      <div className="double-bar-container">
        <div className="fixed-bar">
          <Sidebar />
        </div>
        <div className="collapse-bar">
          <PdfSummarizerSidebar
            onSectionChange={setActiveSection}
            activeSection={activeSection}
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      <div className={`main-content ${isCollapsed ? "expanded" : ""}`}>
        <PdfSummarizerTopbar />
        <div className="content-area">
          {activeSection === "upload" && <PDFUploader />}
          {activeSection === "history" && <PdfHistory />}
        </div>
      </div>
    </div>
  );
}

export default Pdf_main;
