// import React, { useState } from 'react';
// import axios from 'axios';
// import MCQPopup from './MCQPopup';
// import './SummarySection.css';
// const SummarySection = ({ summary, pdfFile, onSaveSuccess, pdfId }) => {
//   const [showMCQPopup, setShowMCQPopup] = useState(false);

//   const handleSave = async () => {
//     const formData = new FormData();
//     formData.append('pdf', pdfFile);
//     formData.append('summaryText', summary);

//     try {
//       const res = await axios.post('/api/pdf/save-pdf', formData);
//       alert('PDF and Summary saved.');
//       onSaveSuccess(res.data.pdfId);
//     } catch (err) {
//       console.error('Save Error:', err);
//       alert('Failed to save');
//     }
//   };

//   return (
//     <div className="summary-section">
//       <h3 className="summary-section__title">Summary</h3>
//       <pre className="summary-section__text">{summary}</pre>

//       {!pdfId && (
//         <button onClick={handleSave} className="summary-section__save-btn">
//           Save to Database
//         </button>
//       )}

//       {pdfId && (
//         <button
//           onClick={() => setShowMCQPopup(true)}
//           className="summary-section__mcq-btn"
//         >
//           Generate MCQs
//         </button>
//       )}

//       {showMCQPopup && (
//         <MCQPopup summaryText={summary} pdfId={pdfId} onClose={() => setShowMCQPopup(false)} />
//       )}
//     </div>
//   );
// };

// export default SummarySection;

import React, { useState, useRef } from "react";
import axios from "axios";
import MCQView from "./MCQView";

import "./SummarySection.css";
// import { ReactComponent as PdfIcon } from './pdf-icon.svg';

const SummarySection = ({ summary, pdfFile, onSaveSuccess }) => {
  const [mcqs, setMcqs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [showMCQs, setShowMCQs] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const summaryRef = useRef(null);

 function cleanSummaryString(summary) {
  if (!summary) return "";

  // Remove code block markers
  const noCodeBlock = summary
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  // Try to extract the first valid JSON array from the text
  const match = noCodeBlock.match(/\[\s*{[\s\S]*?}\s*]/);

  return match ? match[0] : "";
}


let parsedSummary = [];
try {
  const cleanedSummary = cleanSummaryString(summary);
  parsedSummary = cleanedSummary ? JSON.parse(cleanedSummary) : [];
} catch (e) {
  console.error("Error parsing summary", e);
}



  const generateMCQs = async () => {
    setGenerating(true);
    try {
      // Reconstruct raw text from parsed JSON
      const rawTextSummary = parsedSummary.map(item => 
        `${item.title}\n${item.content}`
      ).join('\n\n');
      
      const res = await axios.post("/api/pdf/mcq", { summaryText: rawTextSummary });
      const parsed = parseMCQs(res.data.mcqs);
      setMcqs(parsed);
      setShowMCQs(true);
    } catch (err) {
      console.error("MCQ Generation Error:", err);
      alert("Failed to generate MCQs");
    }
    setGenerating(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("summaryText", summary);
    formData.append("mcqs", JSON.stringify(mcqs));

    try {
      const res = await axios.post("/api/pdf/save-all", formData);
      alert("PDF, summary, and MCQs saved.");
      onSaveSuccess(res.data.pdfId);
    } catch (err) {
      console.error("Save All Error:", err);
      alert("Failed to save all data");
    }
    setSaving(false);
  };

  const copyToClipboard = () => {
    if (summaryRef.current) {
      const text = parsedSummary
        .map((item) => `${item.title}\n${item.content}`)
        .join("\n\n");

      navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard!");
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="summary-section" ref={summaryRef}>
      {/* PDF Header */}
      <div className="pdf-header">
        <div className="pdf-icon-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fill="#68d391"
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            />
            <path fill="#81e6d9" d="M14 3v5h5M12 18v-6m-3 3h6" />
          </svg>
          <div>
            <h3 className="pdf-filename">{pdfFile.name}</h3>
            <p className="pdf-generated-time">Generated just now</p>
          </div>
        </div>
      </div>

      {/* Summary Accordions */}
      <div className="accordions-container">
        {parsedSummary.map((item, index) => (
          <div
            key={index}
            className={`accordion ${activeAccordion === index ? "active" : ""}`}
          >
            <div
              className="accordion-header"
              onClick={() => toggleAccordion(index)}
            >
              <h4>{item.title}</h4>
              <span className="accordion-icon">
                {activeAccordion === index ? "−" : "+"}
              </span>
            </div>
            <div className="accordion-content">
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="copy-btn" onClick={copyToClipboard}>
          Copy Summary
        </button>
        <button
          onClick={generateMCQs}
          disabled={generating}
          className="mcq-btn"
        >
          {generating ? "Generating..." : "Generate MCQs"}
        </button>
      </div>

      {/* MCQs Modal */}
      {showMCQs && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowMCQs(false)}>
              &times;
            </button>
            <MCQView
              mcqs={mcqs}
              onSave={handleSaveAll}
              saving={saving}
              onTestStart={() => {
                setShowMCQs(false);
                setShowTest(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Test Modal */}
      {/* {showTest && (
        <div className="modal-overlay">
          <div className="modal test-modal">
            <button className="modal-close" onClick={() => setShowTest(false)}>
              &times;
            </button>
            <MCQTest mcqs={mcqs} />
          </div>
        </div>
      )} */}
    </div>
  );
};

// Helper to parse Gemini MCQ output
function parseMCQs(mcqText) {
  const mcqs = [];
  const blocks = mcqText.split(/Q\d+\./g).filter(Boolean);

  blocks.forEach((block) => {
    const lines = block.trim().split("\n");
    const question = lines[0];
    const options = lines.slice(1, 5).map((line) => line.slice(3).trim());
    const answerLine = lines.find((line) => line.startsWith("Answer:"));
    const answer = answerLine?.split("Answer:")[1]?.trim();

    if (question && options.length === 4 && answer) {
      mcqs.push({ question, options, answer });
    }
  });

  return mcqs;
}

export default SummarySection;
