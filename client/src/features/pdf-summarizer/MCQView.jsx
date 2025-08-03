import React from 'react';
import './MCQView.css';
const MCQView = ({ mcqs }) => {
  return (
    <div className="mcq-view">
      <h4 className="mcq-view__title">MCQ Questions</h4>
      {mcqs.map((mcq, index) => (
        <div key={index} className="mcq-view__item">
          <p className="mcq-view__question">{`Q${index + 1}. ${mcq.question}`}</p>
          <ul className="mcq-view__options">
            {mcq.options.map((opt, i) => (
              <li key={i} className="mcq-view__option">
                {String.fromCharCode(65 + i)}. {opt}
              </li>
            ))}
          </ul>
          <p className="mcq-view__answer">Answer: {mcq.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default MCQView;
