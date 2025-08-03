import React, { useState } from 'react';
import './MCQTest.css';

const MCQTest = ({ mcqs }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex, option) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [qIndex]: option }));
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    mcqs.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });

    setScore(correct);
    setSubmitted(true);
    alert(`Test submitted! Your score: ${correct}/${mcqs.length}`);
  };

  return (
    <div className="mcq-test__container">
      <h3 className="mcq-test__title">Take the Test</h3>

      {mcqs.map((mcq, index) => (
        <div key={index} className="mcq-test__question-box">
          <p className="mcq-test__question">{`Q${index + 1}. ${mcq.question}`}</p>
          <div className="mcq-test__options">
            {mcq.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i); // A, B, C, D
              const isSelected = answers[index] === letter;
              const isCorrect = submitted && mcq.answer === letter;
              const isWrong =
                submitted && isSelected && answers[index] !== mcq.answer;

              return (
                <label
                  key={i}
                  className={`mcq-test__option 
                    ${isSelected ? 'mcq-test__option--selected' : ''}
                    ${isCorrect ? 'mcq-test__option--correct' : ''}
                    ${isWrong ? 'mcq-test__option--wrong' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${index}`}
                    value={letter}
                    checked={isSelected}
                    disabled={submitted}
                    onChange={() => handleSelect(index, letter)}
                  />
                  {letter}. {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit} className="mcq-test__submit-btn">
          Submit Test
        </button>
      )}

      {submitted && (
        <p className="mcq-test__score">
          Score: {score}/{mcqs.length}
        </p>
      )}
    </div>
  );
};

export default MCQTest;
