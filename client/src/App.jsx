import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ResumeAnalyzer from "./features/resume-analyzer/ResumeAnalyzer";
import Pdf_main from "./features/pdf-summarizer/Pdf_main";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./LandingPage/LandingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  return (
    <>

    <Router>
      <Routes>
        {/* Redirect root to login */}
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes */}

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/ResumeAnalyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Pdf_summarizer"
          element={
            <ProtectedRoute>
              <Pdf_main />
            </ProtectedRoute>
          }
        />

        {/* Fallback - if route not found, go to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>

      <ToastContainer position="top-right" autoClose={3000}
     
       />
    
    </>
    
  );
};

export default App;
