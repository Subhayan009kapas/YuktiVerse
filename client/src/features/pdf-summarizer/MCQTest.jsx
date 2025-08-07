import React, { useState, useEffect } from 'react';
import './MCQTest.css';

const MCQTest = ({ mcqs }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const handleSelect = (qIndex, option) => {
    if (!submitted) {
      setAnswers(prev => ({ ...prev, [qIndex]: option }));
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    mcqs.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });

    setScore(correct);
    setSubmitted(true);
    setShowScorePopup(true);
  };

  const resetTest = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowScore(false);
    setShowScorePopup(false);
  };

  useEffect(() => {
    if (showScorePopup) {
      const timer = setTimeout(() => {
        setShowScore(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showScorePopup]);

  return (
    <div className="mcq-test">
      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <div className="score-popup-content">
              <div className={`score-display ${showScore ? 'show' : ''}`}>
                <div className="score-circle">
                  <div className="score-text">
                    {score}<span>/{mcqs.length}</span>
                  </div>
                </div>
                <p className="score-message">
                  {score === mcqs.length ? 'Perfect! 🎉' : 
                  score >= mcqs.length/2 ? 'Great job! 👏' : 'Keep practicing! 💪'}
                </p>
                <div className="score-details">
                  <div className="score-stat">
                    <span>Correct:</span>
                    <span className="correct-stat">{score}</span>
                  </div>
                  <div className="score-stat">
                    <span>Incorrect:</span>
                    <span className="incorrect-stat">{mcqs.length - score}</span>
                  </div>
                  <div className="score-stat">
                    <span>Percentage:</span>
                    <span className="percentage-stat">
                      {Math.round((score / mcqs.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="score-popup-actions">
              <button className="close-score-btn" onClick={() => setShowScorePopup(false)}>
                Close
              </button>
              <button className="review-score-btn" onClick={resetTest}>
                Retry Test
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="test-header">
        <h3 className="mcq-test__title">
          <span className="accent-text">Test</span> Your Knowledge
        </h3>
        
        {!submitted ? (
          <p className="mcq-test__instructions">
            Answer the following questions. You can't change answers after submission.
          </p>
        ) : null}
      </div>

      <div className={`mcq-test__questions ${showScorePopup ? 'blurred' : ''}`}>
        {mcqs.map((mcq, index) => (
          <div 
            key={index} 
            className={`mcq-test__question-box ${submitted ? 'submitted' : ''}`}
          >
            <div className="question-header">
              <div className="question-number">Q{index + 1}</div>
              <p className="mcq-test__question">{mcq.question}</p>
            </div>
            <div className="mcq-test__options">
              {mcq.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = answers[index] === letter;
                const isCorrect = submitted && mcq.answer === letter;
                const isWrong = submitted && isSelected && answers[index] !== mcq.answer;

                return (
                  <div
                    key={i}
                    className={`mcq-test__option 
                      ${isSelected ? 'selected' : ''}
                      ${isCorrect ? 'correct' : ''}
                      ${isWrong ? 'wrong' : ''}`}
                    onClick={() => !submitted && handleSelect(index, letter)}
                  >
                    <div className="option-letter">{letter}.</div>
                    <div className="option-text">{opt}</div>
                    {isCorrect && (
                      <div className="feedback-icon correct-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/>
                        </svg>
                      </div>
                    )}
                    {isWrong && (
                      <div className="feedback-icon wrong-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button 
          onClick={handleSubmit} 
          className="mcq-test__submit-btn"
          disabled={Object.keys(answers).length < mcqs.length}
        >
          Submit Test
        </button>
      ) : (
        <div className={`test-actions ${showScorePopup ? 'blurred' : ''}`}>
          <button 
            onClick={resetTest}
            className="retry-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Retry Test
          </button>
          <button className="review-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            Review Answers
          </button>
        </div>
      )}
    </div>
  );
};

export default MCQTest;