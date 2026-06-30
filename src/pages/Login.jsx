import React, { useState } from "react";
import "../styles/global.css";
import "../styles/login.css";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import loginBg from "../assets/login-bg.png";
import Toast from "../components/ui/Toast";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login Called");
    // Simply navigate to dashboard for mock login
    // navigate("/dashboard");
    try {
      const response = await login({
        username,
        password
      });
      console.log(response);
      if (response.status == 200) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        setToastMsg(response.data?.message || "Login failed");
        setToastType("error");
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || "An error occurred during login";
      setToastMsg(errMsg);
      setToastType("error");
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 10, 18, 0.4), rgba(10, 10, 18, 0.6)), url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Background glow effects */}
      <div className="ambient-glow bg-blue"></div>
      <div className="ambient-glow bg-green"></div>

      <div className="login-card glass-card">
        {/* Logo and Brand Header */}
        <div className="login-header">
          <svg className="login-logo animate-glow" width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 60C40 48.9543 48.9543 40 60 40H140C151.046 40 160 48.9543 160 60V140C160 151.046 151.046 160 140 160H60C48.9543 160 40 151.046 40 140V60Z" fill="#5B8CFF" fillOpacity="0.15" />
            <path d="M70 70L100 100L70 130" stroke="#5B8CFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M110 70L140 100L110 130" stroke="#5B8CFF" strokeWidth="14" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="login-brand-title">FlowSync</h1>
          <p className="login-brand-subtitle">Productivity Workspace</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">person</span>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">lock</span>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" className="checkbox-input" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="login-submit-btn glow-primary" >
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="signup-link">Register</Link>
        </div>
      </div>
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Login;
