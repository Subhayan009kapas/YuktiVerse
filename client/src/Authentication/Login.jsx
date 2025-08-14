import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // If no "from" is provided, default to Academic Organizer
  const redirectPath = location.state?.from || "/feature/academic-org";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      toast.success("✅ Logged in successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });

      setTimeout(() => {
        navigate(redirectPath, { replace: true }); // redirect to intended page
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Login failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue</p>
        <form onSubmit={handleLogin} className="login-form">
          <input
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        <p className="login-footer">
          Don’t have an account?{" "}
          <Link to="/register" className="login-register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
