import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL;
const frontenedURL = import.meta.env.VITE_FRONTENED_URL;
import "./Login.css"; // ✅ dedicated styling for login

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [backgroundAnimationKey, setBackgroundAnimationKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced background animation trigger - same as register component
  useEffect(() => {
    const timer = setTimeout(() => {
      setBackgroundAnimationKey(prev => prev + 1);
    }, 500); // 500ms delay for smooth animation

    return () => clearTimeout(timer);
  }, [email, password]);

  
  const redirectPath = location.state?.from || "/feature/academic-org";

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

      setIsLoading(true); // ✅ Set loading to true at the start
  setErrors({}); 
    try {
      const res = await axios.post(`${backendURL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.id);
      // console.log(res);

      // console.log("token is", localStorage.getItem("token"));

      // alert("Logged in successfully");
      // const navigateLink = `/feature/academic-org`;
      // navigate(navigateLink);

            setTimeout(() => {
        navigate(redirectPath, { replace: true }); // redirect to intended page
      }, 800);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }finally {
    setIsLoading(false); // ✅ Always set loading to false when done
  }
  };

  if (!mounted) return null;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
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
    filter: 'blur(40px)',
    opacity: '0.4',
    animation: `float ${12 + Math.random() * 15}s ease-in-out infinite`,
    animationDelay: `${i * 0.7 + backgroundAnimationKey * 0.1}s`,
    background: i % 4 === 0 
      ? 'linear-gradient(45deg, #8b5cf6, #06b6d4)' 
      : i % 4 === 1
      ? 'linear-gradient(45deg, #ec4899, #f59e0b)'
      : i % 4 === 2
      ? 'linear-gradient(45deg, #10b981, #3b82f6)'
      : 'linear-gradient(45deg, #a855f7, #ec4899)',
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
    maxWidth: '448px',
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
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6)',
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
    background: 'linear-gradient(135deg, #ffffff, #e9d5ff, #fce7f3)',
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

  const buttonStyle = {
    width: '100%',
    padding: '18px 28px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6)',
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
    boxShadow: '0 12px 28px rgba(139, 92, 246, 0.35)',
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
          .login-card:hover {
            transform: scale(1.02);
            box-shadow: 0 40px 80px -12px rgba(0, 0, 0, 0.5);
          }
          .logo-container:hover {
            transform: rotate(15deg) scale(1.1);
          }
          .login-input:focus {
            background-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 2px #8b5cf6;
            border-color: transparent;
            transform: translateY(-2px);
          }
          .login-input:focus + .input-icon {
            color: #c4b5fd;
            transform: translateY(-50%) scale(1.1);
          }
          .password-toggle:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #c4b5fd;
          }
          .login-button:hover:not(:disabled) {
            transform: scale(1.05) translateY(-2px);
            background: linear-gradient(135deg, #7c3aed, #db2777, #2563eb);
            box-shadow: 0 16px 32px rgba(139, 92, 246, 0.4);
          }
          .login-button:active:not(:disabled) {
            transform: scale(0.98) translateY(0px);
          }
          .login-link:hover {
            color: #e9d5ff;
            text-decoration: underline;
            text-decoration-color: #c4b5fd;
          }
          .login-input:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.25);
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='0.03'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM10 10c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm60 60c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: '0.15',
          transition: 'opacity 0.8s ease'
        }} />
      </div>

      {/* Main login card */}
      <div style={cardStyle} className="login-card">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={logoContainerStyle} className="logo-container">
            <div style={logoShimmerStyle}></div>
            <Sparkles size={36} color="#ffffff" />
          </div>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Sign in to continue your journey with YuktiVerse</p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '32px' }}>
          {/* Email field */}
          <div style={inputContainerStyle}>
            <div style={iconStyle} className="input-icon">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              className="login-input"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={passwordInputStyle}
              className="login-input"
              placeholder="Enter your password"
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
            {errors.password && (
              <p style={errorStyle}>
                ⚠️ {errors.password}
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

          {/* Login button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            style={isLoading ? disabledButtonStyle : buttonStyle}
            className="login-button"
          >
            {isLoading ? (
              <>
                <div style={spinnerStyle} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={{ color: '#d1d5db', fontSize: '15px', margin: '0' }}>
            Don't have an account?{" "}
            <a href="/register" style={linkStyle} className="login-link">
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;