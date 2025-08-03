// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import ResumeAnalyzer from './features/resume-analyzer/ResumeAnalyzer';


const App = () => {
  return (
    <Router>
      <Routes>
       

        {/* Resume Analyzer Page */}
        <Route path="/ResumeAnalyzer" element={<ResumeAnalyzer />} />
        {/* PDF Processor Page */}
        {/* <Route path="/PDFProcessor" element={<PDFProcessor />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
