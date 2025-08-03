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

import React, { useState } from "react";
import axios from "axios";
import MCQView from "./MCQView";
import "./SummarySection.css";
import MCQTest from "./MCQTest";

const SummarySection = ({ summary, pdfFile, onSaveSuccess }) => {
  const [mcqs, setMcqs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const generateMCQs = async () => {
    setGenerating(true);
    try {
      const res = await axios.post("/api/pdf/mcq", { summaryText: summary });
      const parsed = parseMCQs(res.data.mcqs);
      setMcqs(parsed);
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

  return (
    <div className="summary-section">
      <h3 className="summary-section__title">Summary</h3>
      <pre className="summary-section__text">{summary}</pre>

      <div className="summary-section__button-row">
        <button
          onClick={generateMCQs}
          disabled={generating}
          className="summary-section__mcq-btn"
        >
          {generating ? "Generating MCQs..." : "Generate MCQs"}
        </button>

        <button
          onClick={() => setShowTest(true)}
          disabled={!mcqs.length}
          className="summary-section__test-btn"
        >
          Give a Test
        </button>
      </div>

      {showTest && <MCQTest mcqs={mcqs} />}

      {mcqs.length > 0 && (
        <>
          <MCQView mcqs={mcqs} />
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="summary-section__save-btn"
          >
            {saving ? "Saving..." : "Save to Database"}
          </button>
        </>
      )}
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
