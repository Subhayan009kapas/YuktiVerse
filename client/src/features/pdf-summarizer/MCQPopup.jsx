// import React, { useState } from "react";
// import axios from "axios";
// import MCQView from "./MCQView";
// import MCQTest from "./MCQTest";
// import "./MCQPopup.css";

// const MCQPopup = ({ summaryText, pdfId, onClose }) => {
//   const [mcqs, setMcqs] = useState(null);
//   const [showQA, setShowQA] = useState(false);

//   const generateMCQs = async () => {
//     try {
//       console.log(localStorage.getItem("token"));
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/pdf/mcq`,
//         { summaryText },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const parsed = parseMCQs(res.data.mcqs);
//       setMcqs(parsed);
//     } catch (err) {
//       console.error("MCQ Error:", err);
//       alert("Failed to generate MCQs");
//     }
//   };

//   const saveMCQs = async () => {
//     try {
//       await axios.post(
//         "https://yuktiverse-mgqi.onrender.com/api/pdf/save-mcqs",
//         { pdfId, mcqs },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       alert("MCQs saved successfully!");
//     } catch (err) {
//       console.error("Save MCQs Error:", err);
//       alert("Failed to save MCQs");
//     }
//   };

//   return (
//     <div className="mcq-popup">
//       <div className="mcq-popup__content">
//         <h3 className="mcq-popup__title">Generate MCQs</h3>
//         {!mcqs ? (
//           <>
//             <button onClick={generateMCQs} className="mcq-popup__btn">
//               Generate Now
//             </button>
//             <button onClick={onClose} className="mcq-popup__close-btn">
//               Close
//             </button>
//           </>
//         ) : (
//           <>
//             <button
//               onClick={() => setShowQA(true)}
//               className="mcq-popup__option"
//             >
//               View Q&A
//             </button>

//             {showQA && <MCQView mcqs={mcqs} />}
//             <button onClick={saveMCQs} className="mcq-popup__save-btn">
//               Save MCQs to Database
//             </button>
//             <button onClick={onClose} className="mcq-popup__close-btn">
//               Close
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// function parseMCQs(mcqText) {
//   const mcqs = [];
//   const blocks = mcqText.split(/Q\d+\./g).filter(Boolean);

//   blocks.forEach((block) => {
//     const lines = block.trim().split("\n");
//     const question = lines[0];
//     const options = lines.slice(1, 5).map((line) => line.slice(3).trim());
//     const answerLine = lines.find((line) => line.startsWith("Answer:"));
//     const answer = answerLine?.split("Answer:")[1]?.trim();

//     if (question && options.length === 4 && answer) {
//       mcqs.push({ question, options, answer });
//     }
//   });

//   return mcqs;
// }

// export default MCQPopup;




import React, { useState } from "react";
import axios from "axios";
import MCQView from "./MCQView";
import MCQTest from "./MCQTest";
import "./MCQPopup.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;

const MCQPopup = ({ summaryText, pdfId, onClose }) => {
  const [mcqs, setMcqs] = useState(null);
  const [showQA, setShowQA] = useState(false);

  const generateMCQs = async () => {
    try {
      console.log(localStorage.getItem("token"));
      const res = await axios.post(
        `${backendURL}/api/pdf/mcq`,
        { summaryText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const parsed = parseMCQs(res.data.mcqs);
      setMcqs(parsed);
    } catch (err) {
      console.error("MCQ Error:", err);
      alert("Failed to generate MCQs");
    }
  };

  const saveMCQs = async () => {
    try {
      await axios.post(
        `${backendURL}/api/pdf/save-mcqs`,
        { pdfId, mcqs },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("MCQs saved successfully!");
    } catch (err) {
      console.error("Save MCQs Error:", err);
      alert("Failed to save MCQs");
    }
  };

  return (
    <div className="mcq-popup">
      <div className="mcq-popup__content">
        <h3 className="mcq-popup__title">Generate MCQs</h3>
        {!mcqs ? (
          <>
            <button onClick={generateMCQs} className="mcq-popup__btn">
              Generate Now
            </button>
            <button onClick={onClose} className="mcq-popup__close-btn">
              Close
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowQA(true)}
              className="mcq-popup__option"
            >
              View Q&A
            </button>

            {showQA && <MCQView mcqs={mcqs} />}
            <button onClick={saveMCQs} className="mcq-popup__save-btn">
              Save MCQs to Database
            </button>
            <button onClick={onClose} className="mcq-popup__close-btn">
              Close
            </button>
          </>
        )}
      </div>
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

export default MCQPopup;
