// import React from 'react';
// import './MCQView.css';
// const MCQView = ({ mcqs }) => {
//   return (
//     <div className="mcq-view">
//       <h4 className="mcq-view__title">MCQ Questions</h4>
//       {mcqs.map((mcq, index) => (
//         <div key={index} className="mcq-view__item">
//           <p className="mcq-view__question">{`Q${index + 1}. ${mcq.question}`}</p>
//           <ul className="mcq-view__options">
//             {mcq.options.map((opt, i) => (
//               <li key={i} className="mcq-view__option">
//                 {String.fromCharCode(65 + i)}. {opt}
//               </li>
//             ))}
//           </ul>
//           <p className="mcq-view__answer">Answer: {mcq.answer}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MCQView;


import React from 'react';
import { useState } from 'react';
import './MCQView.css';
import MCQTest from "./MCQTest";


const MCQView = ({ mcqs, onSave, saving }) => {
  const [showTest, setShowTest] = useState(false);
  return (
    <div className="mcq-view">
      <h3 className="mcq-view__title">
        <span className="accent-text">Generated</span> MCQs
      </h3>
      <p className="mcq-view__subtitle">
        {mcqs.length} questions generated from your document
      </p>
      
      <div className="mcq-list">
        {mcqs.map((mcq, index) => (
          <div key={index} className="mcq-card">
            <p className="mcq-card__question">
              <span className="question-number">Q{index + 1}.</span> {mcq.question}
            </p>
            <div className="mcq-card__options">
              {mcq.options.map((opt, i) => (
                <div 
                  key={i} 
                  className={`mcq-card__option ${mcq.answer === String.fromCharCode(65 + i) ? 'correct' : ''}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}.</span> 
                  <span className="option-text">{opt}</span>
                  {mcq.answer === String.fromCharCode(65 + i) && (
                    <span className="correct-badge">Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mcq-actions">
        <button 
          className="test-btn"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save to Database"}
        </button>
        <button 
          className="start-test-btn"
          onClick={() => {
            setShowTest(true);
          }}
        >
          Start Test
        </button>
      </div>
       {showTest && (
        <div className="modal-overlay">
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