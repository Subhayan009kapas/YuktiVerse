import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {User, Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff, Upload, X} from "lucide-react";

const backendURL = import.meta.env.VITE_BACKEND_URL;

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [backgroundAnimationKey, setBackgroundAnimationKey] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);
const navigate = useNavigate();

  // Debounced background animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setBackgroundAnimationKey(prev => prev + 1);
    }, 500); // 500ms delay for smooth animation

    return () => clearTimeout(timer);
  }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: "Please select a valid image file" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: "Image size should be less than 5MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear any previous error
      setErrors(prev => ({ ...prev, profileImage: "" }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
    setErrors(prev => ({ ...prev, profileImage: "" }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${backendURL}/api/auth/register`, formData);

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

  if (!mounted) return null;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0a17 0%, #4c1d95 30%, #1e293b 70%, #0c0a17 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const backgroundStyle = {
    position: 'absolute',
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none'
  };

  const orbStyle = (i) => ({
    position: 'absolute',
    borderRadius: '50%',
    mixBlendMode: 'screen',
    filter: 'blur(50px)',
    opacity: '0.4',
    animation: `float ${12 + Math.random() * 15}s ease-in-out infinite`,
    animationDelay: `${i * 0.7 + backgroundAnimationKey * 0.1}s`,
    background: i % 4 === 0 
      ? 'linear-gradient(45deg, #a855f7, #06b6d4)' 
      : i % 4 === 1
      ? 'linear-gradient(45deg, #f59e0b, #ef4444)'
      : i % 4 === 2
      ? 'linear-gradient(45deg, #10b981, #8b5cf6)'
      : 'linear-gradient(45deg, #3b82f6, #ec4899)',
    width: `${Math.random() * 250 + 120}px`,
    height: `${Math.random() * 250 + 120}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  const cardStyle = {
    position: 'relative',
    zIndex: '10',
    width: '100%',
    maxWidth: '480px',
    backdropFilter: 'blur(25px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    padding: '40px',
    transform: 'scale(1)',
    transition: 'all 0.6s ease'
  };

  const logoContainerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #a855f7, #f59e0b, #ec4899)',
    borderRadius: '20px',
    marginBottom: '20px',
    transform: 'rotate(0deg)',
    transition: 'transform 0.4s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const logoShimmerStyle = {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 3s ease-in-out infinite'
  };

  const titleStyle = {
    fontSize: '36px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ffffff, #e9d5ff, #fbbf24)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
    textAlign: 'center',
    letterSpacing: '-0.02em'
  };

  const subtitleStyle = {
    color: '#d1d5db',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '40px',
    opacity: '0.8'
  };

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '24px'
  };

  const iconStyle = {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    zIndex: '2'
  };

  const inputStyle = {
    width: '100%',
    paddingLeft: '54px',
    paddingRight: '10px',
    paddingTop: '10px',
    paddingBottom: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    fontWeight: '400'
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: '54px'
  };

  const toggleButtonStyle = {
    position: 'absolute',
    right: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: '2',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const errorStyle = {
    color: '#f87171',
    fontSize: '13px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const profileImageContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '10px',
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    transition: 'all 0.3s ease'
  };

  const imagePreviewStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '12px'
  };

  const uploadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    padding: '18px 28px',
    background: 'linear-gradient(135deg, #a855f7, #f59e0b, #ec4899)',
    color: '#ffffff',
    fontWeight: '700',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 12px 28px rgba(168, 85, 247, 0.35)',
    transform: 'scale(1)',
    transition: 'all 0.3s ease',
    marginTop: '32px',
    letterSpacing: '0.02em'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: '0.6',
    cursor: 'not-allowed',
    transform: 'scale(1)'
  };

  const spinnerStyle = {
    width: '22px',
    height: '22px',
    border: '2.5px solid rgba(255, 255, 255, 0.25)',
    borderTop: '2.5px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const footerStyle = {
    marginTop: '36px',
    textAlign: 'center'
  };

  const linkStyle = {
    color: '#c4b5fd',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  };

  const dividerStyle = {
    margin: '28px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dividerLineStyle = {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    flexGrow: '1'
  };

  const dividerTextStyle = {
    padding: '0 20px',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  };

  const socialContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '24px'
  };

  const socialButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };

  const passwordStrengthStyle = {
    marginTop: '-16px',
    fontSize: '12px',
      position: 'relative',
  zIndex: '1'
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { text: '', color: '#6b7280', width: '0%' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const levels = [
      { text: 'Very Weak', color: '#ef4444', width: '20%' },
      { text: 'Weak', color: '#f97316', width: '40%' },
      { text: 'Fair', color: '#eab308', width: '60%' },
      { text: 'Good', color: '#22c55e', width: '80%' },
      { text: 'Strong', color: '#10b981', width: '100%' }
    ];
    
    return levels[Math.min(strength - 1, 4)] || levels[0];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div style={containerStyle}>
      {/* Keyframe animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
            33% { transform: translateY(-40px) rotate(120deg) scale(1.1); }
            66% { transform: translateY(-70px) rotate(240deg) scale(0.9); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          .register-card:hover {
            transform: scale(1.02);
            box-shadow: 0 40px 80px -12px rgba(0, 0, 0, 0.5);
          }
          .logo-container:hover {
            transform: rotate(15deg) scale(1.1);
          }
          .register-input:focus {
            background-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 2px #a855f7;
            border-color: transparent;
            transform: translateY(-2px);
          }
          .register-input:focus + .input-icon {
            color: #c4b5fd;
            transform: translateY(-50%) scale(1.1);
          }
          .password-toggle:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #c4b5fd;
          }
          .register-button:hover:not(:disabled) {
            transform: scale(1.05) translateY(-2px);
            background: linear-gradient(135deg, #9333ea, #f59e0b, #db2777);
            box-shadow: 0 16px 32px rgba(168, 85, 247, 0.4);
          }
          .register-button:active:not(:disabled) {
            transform: scale(0.98) translateY(0px);
          }
          .social-button:hover {
            background-color: rgba(255, 255, 255, 0.12);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.25);
          }
          .register-link:hover {
            color: #e9d5ff;
            text-decoration: underline;
            text-decoration-color: #c4b5fd;
          }
          .register-input:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.25);
          }
          .upload-area:hover {
            border-color: rgba(255, 255, 255, 0.4);
            background-color: rgba(255, 255, 255, 0.08);
          }
          .upload-button:hover {
            background-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
          }
          .remove-button:hover {
            background-color: rgba(239, 68, 68, 1);
            transform: scale(1.1);
          }
        `}
      </style>

      {/* Animated background elements */}
      <div style={backgroundStyle} key={backgroundAnimationKey}>
        {/* Floating orbs */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`${backgroundAnimationKey}-${i}`} style={orbStyle(i)} />
        ))}

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: '0',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.03'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM10 10c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm60 60c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: '0.15',
          transition: 'opacity 0.8s ease'
        }} />
      </div>

      {/* Main register card */}
      <div style={cardStyle} className="register-card">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* <div style={logoContainerStyle} className="logo-container">
            <div style={logoShimmerStyle}></div>
            <UserPlus size={36} color="#ffffff" />
          </div> */}
          <h3 style={titleStyle}>Create Account</h3>
          <p style={subtitleStyle}>Join YuktiVerse today and unlock your potential</p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '32px' }}>
          
          {/* Profile Image Upload */}
          {/* <div style={profileImageContainerStyle} className="upload-area">
            {previewImage ? (
              <div style={{ position: 'relative' }}>
                <img src={previewImage} alt="Profile preview" style={imagePreviewStyle} />
                <button
                  onClick={removeImage}
                  style={removeButtonStyle}
                  className="remove-button"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Upload size={32} color="#9ca3af" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 12px 0' }}>
                  Profile Picture (Optional)
                </p>
              </div>
            )}
            
            <label style={uploadButtonStyle} className="upload-button">
              <Upload size={16} />
              {previewImage ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            
            {errors.profileImage && (
              <p style={{ ...errorStyle, marginTop: '12px', justifyContent: 'center' }}>
                ⚠️ {errors.profileImage}
              </p>
            )}
          </div> */}

          {/* Name field */}
          <div style={inputContainerStyle}>
            <div style={iconStyle} className="input-icon">
              <User size={20} />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              className="register-input"
              placeholder="Enter your full name"
              required
            />
            {errors.name && (
              <p style={errorStyle}>
                ⚠️ {errors.name}
              </p>
            )}
          </div>

          {/* Email field */}
          <div style={inputContainerStyle}>
            <div style={iconStyle} className="input-icon">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              className="register-input"
              placeholder="Enter your email address"
              required
            />
            {errors.email && (
              <p style={errorStyle}>
                ⚠️ {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={inputContainerStyle}>
            <div style={iconStyle} className="input-icon">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={passwordInputStyle}
              className="register-input"
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleButtonStyle}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {/* Password strength indicator */}
            {/* {formData.password && (
              <div style={passwordStrengthStyle}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                    marginBottom: '0px',
                     position: 'relative',
  zIndex: '1'
                }}>
                  <div style={{
                    width: passwordStrength.width,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <span style={{ color: passwordStrength.color, fontSize: '12px', fontWeight: '500' }}>
                  Password strength: {passwordStrength.text}
                </span>
              </div>
            )} */}
            
            {errors.password && (
              <p style={errorStyle}>
                ⚠️ {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password field */}
          <div style={inputContainerStyle}>
            <div style={iconStyle} className="input-icon">
              <Lock size={20} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={passwordInputStyle}
              className="register-input"
              placeholder="Re-enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={toggleButtonStyle}
              className="password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {errors.confirmPassword && (
              <p style={errorStyle}>
                ⚠️ {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '20px'
            }}>
              <p style={{ ...errorStyle, margin: '0', textAlign: 'center', fontSize: '14px' }}>
                ❌ {errors.submit}
              </p>
            </div>
          )}

          {/* Register button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            style={isLoading ? disabledButtonStyle : buttonStyle}
            className="register-button"
          >
            {isLoading ? (
              <>
                <div style={spinnerStyle} />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={{ color: '#d1d5db', fontSize: '15px', margin: '0' }}>
            Already have an account?{" "}
            <a href="/login" style={linkStyle} className="register-link">
              Login here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;