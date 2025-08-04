// import React, { useState } from 'react';
// import './MCQTest.css';

// const MCQTest = ({ mcqs }) => {
//   const [answers, setAnswers] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [score, setScore] = useState(0);

//   const handleSelect = (qIndex, option) => {
//     if (!submitted) {
//       setAnswers((prev) => ({ ...prev, [qIndex]: option }));
//     }
//   };

//   const handleSubmit = () => {
//     let correct = 0;
//     mcqs.forEach((q, i) => {
//       if (answers[i] === q.answer) correct += 1;
//     });

//     setScore(correct);
//     setSubmitted(true);
//     alert(`Test submitted! Your score: ${correct}/${mcqs.length}`);
//   };

//   return (
//     <div className="mcq-test__container">
//       <h3 className="mcq-test__title">Take the Test</h3>

//       {mcqs.map((mcq, index) => (
//         <div key={index} className="mcq-test__question-box">
//           <p className="mcq-test__question">{`Q${index + 1}. ${mcq.question}`}</p>
//           <div className="mcq-test__options">
//             {mcq.options.map((opt, i) => {
//               const letter = String.fromCharCode(65 + i); // A, B, C, D
//               const isSelected = answers[index] === letter;
//               const isCorrect = submitted && mcq.answer === letter;
//               const isWrong =
//                 submitted && isSelected && answers[index] !== mcq.answer;

//               return (
//                 <label
//                   key={i}
//                   className={`mcq-test__option 
//                     ${isSelected ? 'mcq-test__option--selected' : ''}
//                     ${isCorrect ? 'mcq-test__option--correct' : ''}
//                     ${isWrong ? 'mcq-test__option--wrong' : ''}`}
//                 >
//                   <input
//                     type="radio"
//                     name={`q-${index}`}
//                     value={letter}
//                     checked={isSelected}
//                     disabled={submitted}
//                     onChange={() => handleSelect(index, letter)}
//                   />
//                   {letter}. {opt}
//                 </label>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {!submitted && (
//         <button onClick={handleSubmit} className="mcq-test__submit-btn">
//           Submit Test
//         </button>
//       )}

//       {submitted && (
//         <p className="mcq-test__score">
//           Score: {score}/{mcqs.length}
//         </p>
//       )}
//     </div>
//   );
// };

// export default MCQTest;

import React, { useState } from 'react';
import './MCQTest.css';

const MCQTest = ({ mcqs }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

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
    
    // Show score animation after a delay
    setTimeout(() => setShowScore(true), 300);
  };

  const resetTest = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="mcq-test">
      <h3 className="mcq-test__title">
        <span className="accent-text">Test</span> Your Knowledge
      </h3>
      
      {!submitted ? (
        <p className="mcq-test__instructions">
          Answer the following questions. You can't change answers after submission.
        </p>
      ) : (
        <div className={`score-display ${showScore ? 'show' : ''}`}>
          <div className="score-circle">
            <div className="score-text">
              {score}<span>/{mcqs.length}</span>
            </div>
          </div>
          <p className="score-message">
            {score === mcqs.length ? 'Perfect! 🎉' : 
             score >= mcqs.length/2 ? 'Good job! 👍' : 'Keep practicing! 💪'}
          </p>
        </div>
      )}

      <div className="mcq-test__questions">
        {mcqs.map((mcq, index) => (
          <div 
            key={index} 
            className={`mcq-test__question-box ${submitted ? 'submitted' : ''}`}
          >
            <p className="mcq-test__question">
              <span className="question-number">Q{index + 1}.</span> {mcq.question}
            </p>
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
                      <div className="feedback-icon correct-icon">✓</div>
                    )}
                    {isWrong && (
                      <div className="feedback-icon wrong-icon">✕</div>
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
        <div className="test-actions">
          <button 
            onClick={resetTest}
            className="retry-btn"
          >
            Retry Test
          </button>
          <button className="review-btn">
            Review Answers
          </button>
        </div>
      )}
    </div>
  );
};

export default MCQTest;