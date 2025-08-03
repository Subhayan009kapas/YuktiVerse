import React, { useState } from 'react';
import axios from 'axios';
import SummarySection from './SummarySection';
import './PDFUploader.css';

const PDFUploader = () => {
  const [summary, setSummary] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSavedId, setPdfSavedId] = useState(null);

  const handlePDFChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSummarize = async () => {
    if (!pdfFile) return alert('Upload a PDF first');

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const res = await axios.post('/api/pdf/summarize', formData);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Summarize Error:', err);
      alert('Failed to summarize');
    }
  };

  return (
    <div className="pdf-uploader">
      <h2 className="pdf-uploader__title">Upload PDF</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handlePDFChange}
        className="pdf-uploader__input"
      />
      <button onClick={handleSummarize} className="pdf-uploader__btn">
        Summarize PDF
      </button>

      {summary && (
        <SummarySection
          summary={summary}
          pdfFile={pdfFile}
          onSaveSuccess={setPdfSavedId}
          pdfId={pdfSavedId}
        />
      )}
    </div>
  );
};

export default PDFUploader;
