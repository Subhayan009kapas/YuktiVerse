import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
// import Home from "./pages/Home"; // <
import Notebook from "./features/ai-notepad/Notebook";
import AcademicOrganizer from "./features/academic-notebook/AcademicOrganizer";
import SharedNotebook from "./features/academic-notebook/SharedNotebook";
// import Dashboard from "./features/dashboard/Dashboard";
import { LayoutDashboard, LogIn } from "lucide-react";

import ResumeAnalyzer from "./features/resume-analyzer/ResumeAnalyzer";
import Pdf_main from "./features/pdf-summarizer/Pdf_main";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./LandingPage/LandingPage";
import SplashScreen from "./components/SplashScreen";
import ErrorPage from "../Error Page/ErrorPage";
import MobileNotSupported from "./pages/MobileNotSupported";
import CodingContest from "./features/coding_contest/CodingContest";

 // new mobile page

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);

    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen onLoaded={() => setIsLoading(false)} />;

  // If mobile/tablet, show only MobileNotSupported page
  if (isMobile) return <MobileNotSupported />;

  // Desktop routes (unchanged)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/feature"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="academic-org" element={<AcademicOrganizer />} />
          <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="pdf-summarizer" element={<Pdf_main />} />
          <Route path="coding" element={<CodingContest />} />
        </Route>
        <Route path="/share/notebook/:shareId" element={<SharedNotebook />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}



export default App;