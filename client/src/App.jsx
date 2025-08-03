// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import ResumeAnalyzer from './features/resume-analyzer/ResumeAnalyzer';
import Pdf_main from './features/pdf-summarizer/Pdf_main';


const App = () => {
  return (
    <Router>
      <Routes>
       

        {/* Resume Analyzer Page */}
        <Route path="/ResumeAnalyzer" element={<ResumeAnalyzer />} />
        {/* PDF Processor Page */}
        <Route path="/Pdf_summarizer" element={<Pdf_main/>} />
      </Routes>
    </Router>
  );
};

export default App;
