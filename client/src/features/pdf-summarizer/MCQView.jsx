

import React, { useState, useEffect } from 'react';
import './MCQView.css';
import MCQTest from "./MCQTest";
import NotificationCard from '../../components/NotificationCard';

const MCQView = ({ mcqs, onSave, saving }) => {
  const [showTest, setShowTest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasSaving, setWasSaving] = useState(false);

  useEffect(() => {
    if (wasSaving && !saving) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    setWasSaving(saving);
  }, [saving, wasSaving]);

  

  return (
    
    <div className="mcq-view">
      {showSuccess && (
        <div className="mcq-success-toast">
          <NotificationCard />
        </div>
      )}
      <div className="mcq-header">
        <h3 className="mcq-view__title">
          <span className="accent-text">Generated</span> MCQs
        </h3>
        <p className="mcq-view__subtitle">
          {mcqs.length} questions generated from your document
        </p>
      </div>

      <div className="mcq-list">
        {mcqs.map((mcq, index) => (
          <div key={index} className="mcq-card">
            <div className="question-header">
              <div className="question-number">Q{index + 1}</div>
              <p className="mcq-card__question">{mcq.question}</p>
            </div>
            <div className="mcq-card__options">
              {mcq.options.map((opt, i) => (
                <div
                  key={i}
                  className={`mcq-card__option ${mcq.answer === String.fromCharCode(65 + i) ? 'correct' : ''}`}
                >
                  <div className="option-letter">{String.fromCharCode(65 + i)}</div>
                  <div className="mcq-option-text">{opt}</div>
                  {mcq.answer === String.fromCharCode(65 + i) && (
                    <div className="correct-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z" />
                      </svg>
                      Correct
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mcq-actions">
        <button
          className="test-btn-save"
          onClick={onSave}
          disabled={saving}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
          </svg>
          {saving ? "Saving..." : "Save to Database"}
        </button>
        <button
          className="start-test-btn"
          onClick={() => setShowTest(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6 10.117V5.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43z" />
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z" />
          </svg>
          Start Test
        </button>
      </div>

      {showTest && (
        <div className="modal-overlay">
          <div className="overlay-pattern"></div>
          <div className="modal test-modal">
            <button className="modal-close" onClick={() => setShowTest(false)}>
              &times;
            </button>
            <MCQTest mcqs={mcqs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQView;