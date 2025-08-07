import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import MCQView from "./MCQView";
import "./SummarySection.css";

const SummarySection = ({ summary, pdfFile, onSaveSuccess, pdfId }) => {
  const [mcqs, setMcqs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMCQs, setShowMCQs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const summaryRef = useRef(null);

  // Parse the summary string into an array of topics
  const parsedSummary = useMemo(() => {
    function cleanSummaryString(summary) {
      if (!summary) return "";

      const noCodeBlock = summary
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      const match = noCodeBlock.match(/\[\s*{[\s\S]*?}\s*]/);
      return match ? match[0] : "";
    }

    try {
      const cleanedSummary = cleanSummaryString(summary);
      return cleanedSummary ? JSON.parse(cleanedSummary) : [];
    } catch (e) {
      console.error("Error parsing summary", e);
      return [];
    }
  }, [summary]);

  // Filter topics based on search term
  const filteredTopics = useMemo(() => {
    return parsedSummary
      .map((topic, index) => ({ ...topic, originalIndex: index }))
      .filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [parsedSummary, searchTerm]);

  // Set initial selected topic
  useEffect(() => {
    if (filteredTopics.length > 0) {
      setSelectedTopicIndex(filteredTopics[0].originalIndex);
    }
  }, [filteredTopics]);

  const generateMCQs = async () => {
    setGenerating(true);
    try {
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

  const handleTopicSelect = (index) => {
    setSelectedTopicIndex(index);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get current topic to display
  const currentTopic = parsedSummary[selectedTopicIndex] || 
    (parsedSummary.length > 0 ? parsedSummary[0] : null);

  return (
    <div className="summary-section" ref={summaryRef}>
      <div className="section-header">
        <h1 className="section-title">Document Summary</h1>
        <p className="section-subtitle">Comprehensive overview of key concepts</p>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="layout-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Topics</h3>
          </div>
          
          <div className="topics-list">
            {filteredTopics.map((topic) => (
              <div 
                key={topic.originalIndex} 
                className={`topic-item ${selectedTopicIndex === topic.originalIndex ? 'active-topic' : ''}`}
                onClick={() => handleTopicSelect(topic.originalIndex)}
              >
                <div className="topic-number">{topic.originalIndex + 1}</div>
                <div className="topic-title">{topic.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <div className="header-left">
              <h2>Document Summary</h2>
              <p>AI-generated key points from your document</p>
            </div>
            
            <div className="action-buttons">
              <button className="copy-btn" onClick={copyToClipboard}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy Summary
              </button>
              <button
                onClick={generateMCQs}
                disabled={generating}
                className="mcq-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                  <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                </svg>
                {generating ? "Generating..." : "Generate MCQs"}
              </button>
            </div>
          </div>
          
          {/* Topic View */}
          {currentTopic ? (
            <div className="topic-view">
              <div className="topic-header">
                <div className="topic-badge">{selectedTopicIndex + 1}</div>
                <h3 className="topic-title">{currentTopic.title}</h3>
              </div>
             <div className="topic-content">
  {currentTopic.content.split('\n').map((line, i) => (
    <p key={i}>{line}</p>
  ))}
</div>

            </div>
          ) : (
            <div className="no-topics">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <h3>No topics available</h3>
              <p>Please upload a document to generate a summary</p>
            </div>
          )}
        </div>
      </div>

      {showMCQs && (
        <div className="modal-overlay">
          <div className="overlay-pattern"></div>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowMCQs(false)}>
              &times;
            </button>
            <MCQView
              mcqs={mcqs}
              onSave={handleSaveAll}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

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