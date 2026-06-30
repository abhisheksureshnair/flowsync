import React, { useState } from "react";
import "../styles/global.css";
import "../styles/login.css"; // Reuse login styles for consistency
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";
import loginBg from "../assets/login-bg.png";
import Toast from "../components/ui/Toast";

const AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Molly&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Boots&backgroundColor=e2e8f0"
];

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Member",
    profileImage: AVATARS[0]
  });
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Register Called with data:", formData);

    if (formData.password !== formData.confirmPassword) {
      setToastMsg("Passwords do not match!");
      setToastType("error");
      return;
    }

    try {
      const response = await register(formData);
      if (response.status == 200) {
        setToastMsg("Registration successful! Redirecting...");
        setToastType("success");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setToastMsg(response.data?.message || response.message || "Registration failed");
        setToastType("error");
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || "An error occurred during registration";
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

      <div className="login-card glass-card" style={{ maxWidth: '500px', padding: '30px' }}>
        <div className="login-header" style={{ marginBottom: '10px' }}>
          <h1 className="login-brand-title">Create Account</h1>
          <p className="login-brand-subtitle">Join FlowSync Today</p>
        </div>

        <form className="login-form" onSubmit={handleRegister} style={{ gap: '15px' }}>

          {/* Avatar Selection */}
          <div className="input-group">
            <label className="input-label">Select Avatar</label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
              {AVATARS.map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => setFormData({ ...formData, profileImage: avatar })}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formData.profileImage === avatar ? '3px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    background: 'var(--surface-low)'
                  }}
                >
                  <img src={avatar} alt={`Avatar ${index}`} style={{ width: '100%', height: '100%' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Name</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input type="text" className="form-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Username</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">person</span>
                <input type="text" className="form-input" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">mail</span>
              <input type="email" className="form-input" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Role</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">work</span>
              <select
                className="form-input"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input type="password" className="form-input" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Confirm</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input type="password" className="form-input" name="confirmPassword" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <button type="submit" className="login-submit-btn glow-primary" style={{ marginTop: '10px' }}>
            Register
          </button>
        </form>

        <div className="login-footer" style={{ paddingTop: '15px' }}>
          <span>Already have an account?</span>
          <Link to="/" className="signup-link">Sign In</Link>
        </div>
      </div>
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Register;
