import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, register } from "../api/authApi";
import { fetchteamname, addteamname } from "../api/teamnameApi";
import socket from "../socket/socket";
import Toast from "../components/ui/Toast";
import flowsyncIcon from "../assets/flowsync-icon.png";
import "../styles/login.css";

const Hero = ({
  variant,
  title,
  text,
  buttonLabel,
  onSwitch,
}) => (
  <div className={`hero ${variant}`}>
    <div className="hero-brand-pill">
      <img src={flowsyncIcon} alt="FlowSync" className="hero-pill-icon" />
      <span>FlowSync</span>
    </div>
    <h2>{title}</h2>
    <p>{text}</p>
    <button
      type="button"
      className="switch"
      onClick={onSwitch}
    >
      {buttonLabel}
    </button>
  </div>
);

const LoginForm = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login({ username, password });
      if (response.status === 200) {
        const userId = response.data.user.id || response.data.user._id;
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_id", userId);

        socket.connect();
        socket.emit("join", userId);

        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        showToast(response.data?.message || "Login failed", "error");
      }
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during login";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form login" onSubmit={handleSubmit}>
      <div className="form-brand-header">
        <img src={flowsyncIcon} alt="FlowSync" className="form-brand-icon" />
        <h2>Sign In</h2>
      </div>
      <div className="form-inputs">
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <button
        type="button"
        className="forgot-link-btn"
        onClick={() => showToast("Please contact administrator to reset password", "info")}
      >
        Forgot password?
      </button>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
};

const RegisterForm = ({ onRegisterSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    team: "",
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [teams, setTeams] = useState([]);
  const [fetchingTeams, setFetchingTeams] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchTeamsList = async (manualClick = false) => {
    setFetchingTeams(true);
    try {
      const response = await fetchteamname();
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setTeams(list);
      if (manualClick && list.length === 0) {
        showToast("No team is registered. Click '+ Add Team' to create one.", "info");
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setFetchingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeamsList(false);
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) {
      fetchTeamsList(true);
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelectTeam = (teamName) => {
    setFormData((prev) => ({ ...prev, team: teamName }));
    setIsDropdownOpen(false);
  };

  const handleSaveTeam = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newTeamName.trim();
    if (!trimmed) {
      showToast("Please enter a team name", "warning");
      return;
    }
    setSavingTeam(true);
    try {
      const response = await addteamname({ teamName: trimmed });
      showToast(response?.data?.message || "Team registered successfully!", "success");
      setNewTeamName("");
      setIsAddingTeam(false);
      await fetchTeamsList(false);
      setFormData((prev) => ({ ...prev, team: trimmed }));
    } catch (error) {
      console.error("Error adding team:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add team";
      showToast(errMsg, "error");
    } finally {
      setSavingTeam(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register(formData);
      if (response.status === 200) {
        showToast("Registration successful! Please login.", "success");
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      } else {
        showToast(
          response.data?.message || response.message || "Registration failed",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during registration";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form register" onSubmit={handleSubmit}>
      <div className="form-brand-header">
        <img src={flowsyncIcon} alt="FlowSync" className="form-brand-icon" />
        <h2>Create Account</h2>
      </div>
      <div className="form-inputs">
        {/* Modern Team Dropdown & Add Option above Full Name */}
        <div className="team-control-group">
          {!isAddingTeam ? (
            <div className="team-select-row">
              {/* Custom Modern Dropdown */}
              <div className="team-custom-dropdown" ref={dropdownRef}>
                <div
                  className={`team-dropdown-trigger ${isDropdownOpen ? "open" : ""} ${
                    formData.team ? "has-value" : ""
                  }`}
                  onClick={handleToggleDropdown}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggleDropdown();
                    } else if (e.key === "Escape") {
                      setIsDropdownOpen(false);
                    }
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="team-trigger-content">
                    <div className="team-trigger-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <span className="team-trigger-label">
                      {formData.team
                        ? formData.team
                        : fetchingTeams
                        ? "Loading teams..."
                        : teams.length === 0
                        ? "No team is registered"
                        : "Select Team"}
                    </span>
                  </div>

                  <div className="team-trigger-actions">
                    {formData.team && (
                      <button
                        type="button"
                        className="team-clear-selection-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, team: "" }));
                        }}
                        title="Clear selection"
                      >
                        ✕
                      </button>
                    )}
                    <div className={`team-dropdown-chevron ${isDropdownOpen ? "rotated" : ""}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="team-dropdown-menu" role="listbox">
                    {fetchingTeams ? (
                      <div className="team-menu-status">
                        <div className="team-status-spinner"></div>
                        <span>Loading teams...</span>
                      </div>
                    ) : teams.length === 0 ? (
                      <div className="team-menu-empty">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        <div className="team-empty-text">No team is registered</div>
                        <button
                          type="button"
                          className="team-empty-action-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsAddingTeam(true);
                          }}
                        >
                          + Create New Team
                        </button>
                      </div>
                    ) : (
                      <div className="team-menu-list">
                        {teams.map((t) => {
                          const name = typeof t === "string" ? t : t.teamName;
                          const id = t._id || name;
                          const isSelected = formData.team === name;
                          return (
                            <div
                              key={id}
                              className={`team-menu-item ${isSelected ? "selected" : ""}`}
                              onClick={() => handleSelectTeam(name)}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="team-item-left">
                                <span className="team-item-badge">
                                  {name.slice(0, 2).toUpperCase()}
                                </span>
                                <span className="team-item-name">{name}</span>
                              </div>
                              {isSelected && (
                                <div className="team-item-check">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="team-add-toggle-btn"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsAddingTeam(true);
                }}
                title="Add a new team"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Team</span>
              </button>
            </div>
          ) : (
            <div className="team-add-inline-row">
              <input
                type="text"
                className="team-inline-input"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveTeam();
                  } else if (e.key === "Escape") {
                    setIsAddingTeam(false);
                    setNewTeamName("");
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="team-save-btn"
                onClick={handleSaveTeam}
                disabled={savingTeam}
              >
                {savingTeam ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="team-cancel-btn"
                onClick={() => {
                  setIsAddingTeam(false);
                  setNewTeamName("");
                }}
                title="Cancel"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="input-box">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
};

export const Login = ({ defaultRegister = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(
    defaultRegister || location.pathname === "/register"
  );
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
  };

  return (
    <div className="login-page-container">
      {/* Futuristic Cyber Grid */}
      <div className="login-bg-grid"></div>

      {/* Floating Animated Ambient Glows */}
      <div className="ambient-glow bg-blue"></div>
      <div className="ambient-glow bg-purple"></div>
      <div className="ambient-glow bg-cyan"></div>

      {/* Top Floating Brand Indicator */}
      <div className="login-top-brand">
        <img src={flowsyncIcon} alt="FlowSync" className="top-brand-icon" />
        <span className="top-brand-text">FlowSync</span>
        <span className="top-brand-badge">Workspace</span>
      </div>

      <div className={`card ${isRegister ? "register" : ""}`}>
        <div className="card-bg">
          <div className="card-bg-layer signup-layer"></div>
          <div className="card-bg-layer login-layer"></div>
          <div className="card-bg-overlay"></div>
        </div>

        <Hero
          variant="register"
          title="Welcome back"
          text="Login to review your projects and stay in sync."
          buttonLabel="Login"
          onSwitch={() => setIsRegister(false)}
        />
        <RegisterForm
          onRegisterSuccess={() => setIsRegister(false)}
          showToast={showToast}
        />

        <Hero
          variant="login"
          title="Hello there"
          text="Begin your journey with the ultimate productivity workspace."
          buttonLabel="Sign Up"
          onSwitch={() => setIsRegister(true)}
        />
        <LoginForm
          onLoginSuccess={() => navigate("/dashboard")}
          showToast={showToast}
        />
      </div>

      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />
    </div>
  );
};

export default Login;
