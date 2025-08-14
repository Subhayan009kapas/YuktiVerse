import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://yuktiverse-mgqi.onrender.com/api/auth/register", formData);

      if (res.status === 201 || res.status === 200) {
        toast.success("Registration successful! Please log in.", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        setTimeout(() => {
          navigate("/login");
        }, 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Registration failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join YuktiVerse today</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="register-input"
          />

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login" className="register-login-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
