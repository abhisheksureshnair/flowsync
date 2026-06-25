import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";
import "../styles/settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [themeMode, setThemeMode] = useState("dark");
  const [fullName, setFullName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex.rivera@flowsync.io");
  const [jobTitle, setJobTitle] = useState("Product Lead");
  const [bio, setBio] = useState("Building the next generation of productivity tools. Obsessed with flow states and clean UI.");

  const categories = [
    { id: "profile", label: "Profile", icon: "person", color: "text-primary" },
    { id: "theme", label: "Theme", icon: "palette", color: "text-tertiary" },
    { id: "notifications", label: "Notifications", icon: "notifications_active", color: "text-secondary" },
    { id: "workspace", label: "Workspace", icon: "lan", color: "text-primary" },
    { id: "security", label: "Security", icon: "security", color: "text-error" },
    { id: "billing", label: "Billing", icon: "payments", color: "text-secondary" }
  ];

  return (
    <div className="app-layout">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search settings..." />
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Quick Actions</button>
            <button className="btn-primary">Create</button>
            <div className="header-divider"></div>
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">group</span>
            </button>
          </div>
        </header>

        <div className="settings-container custom-scrollbar">
          {/* Header */}
          <div className="settings-header">
            <h2 className="settings-title">Settings</h2>
            <p className="settings-subtitle">Manage your workspace preferences and account details.</p>
          </div>

          {/* Bento grid layout */}
          <div className="settings-bento-grid">
            
            {/* Left Column Navigation */}
            <div className="settings-nav-col">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  className={`settings-nav-btn ${activeTab === cat.id ? "active-accent" : ""}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  <div className="nav-btn-left">
                    <span className={`material-symbols-outlined ${cat.color}`}>{cat.icon}</span>
                    <span className="nav-btn-label">{cat.label}</span>
                  </div>
                  <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                </button>
              ))}
            </div>

            {/* Right Column Content */}
            <div className="settings-content-col">
              
              {/* Profile details section */}
              <section className="settings-panel-card glass-card relative-overflow">
                <div className="top-color-bar"></div>
                <h3 className="panel-card-title mb-lg">Account Details</h3>

                <div className="profile-uploader-row">
                  <div className="avatar-preview-box">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
                    <button className="upload-btn-overlay">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </button>
                  </div>
                  
                  <div className="uploader-info">
                    <h5 className="uploader-title">Profile Picture</h5>
                    <p className="uploader-desc">PNG or JPG. Max size 2MB.</p>
                  </div>
                </div>

                <form className="profile-fields-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label className="field-label">Full Name</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-field-group">
                      <label className="field-label">Email Address</label>
                      <input 
                        type="email" 
                        className="field-input" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Job Title</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Timezone</label>
                      <select className="field-select">
                        <option>Pacific Time (PT)</option>
                        <option>Eastern Time (ET)</option>
                        <option>Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Bio</label>
                    <textarea 
                      className="field-textarea custom-scrollbar" 
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-submit-row">
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </div>
                </form>
              </section>

              {/* Appearance / Theme Options */}
              <section className="settings-panel-card glass-card">
                <div className="appearance-header-row mb-lg">
                  <div>
                    <h3 className="panel-card-title">Appearance</h3>
                    <p className="panel-card-desc">Customize how FlowSync looks on your device.</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl">brush</span>
                </div>

                <div className="theme-toggle-options">
                  {/* Theme: Light */}
                  <div 
                    className={`theme-option-box ${themeMode === "light" ? "active" : ""}`}
                    onClick={() => setThemeMode("light")}
                  >
                    <div className="mock-window bg-light-theme">
                      <div className="mock-bar bg-light-bar"></div>
                      <div className="mock-text bg-light-text"></div>
                      <div className="mock-text bg-light-text w-3/4"></div>
                      <div className="mock-dot bg-light-dot"></div>
                    </div>
                    <span className="theme-option-label">Light Mode</span>
                    {themeMode === "light" && (
                      <span className="material-symbols-outlined active-check">check_circle</span>
                    )}
                  </div>

                  {/* Theme: Dark */}
                  <div 
                    className={`theme-option-box ${themeMode === "dark" ? "active" : ""}`}
                    onClick={() => setThemeMode("dark")}
                  >
                    <div className="mock-window bg-dark-theme">
                      <div className="mock-bar bg-dark-bar"></div>
                      <div className="mock-text bg-dark-text"></div>
                      <div className="mock-text bg-dark-text w-3/4"></div>
                      <div className="mock-dot bg-primary"></div>
                    </div>
                    <span className="theme-option-label">Dark Mode</span>
                    {themeMode === "dark" && (
                      <span className="material-symbols-outlined active-check">check_circle</span>
                    )}
                  </div>

                  {/* Theme: System */}
                  <div 
                    className={`theme-option-box ${themeMode === "system" ? "active" : ""}`}
                    onClick={() => setThemeMode("system")}
                  >
                    <div className="mock-window bg-system-theme">
                      <span className="material-symbols-outlined center-devices-icon">devices</span>
                    </div>
                    <span className="theme-option-label">System Default</span>
                    {themeMode === "system" && (
                      <span className="material-symbols-outlined active-check">check_circle</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Storage & Members bento cards */}
              <div className="settings-bento-row">
                {/* Storage Card */}
                <div className="bento-metric-card glass-card">
                  <div className="bento-icon-box bg-secondary-alpha text-secondary">
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                  </div>
                  <div className="bento-metric-details">
                    <span className="bento-metric-label">Storage Usage</span>
                    <h4 className="bento-metric-value">12.4 GB / 50 GB</h4>
                    <div className="bento-progress-track">
                      <div className="bento-progress-fill bg-secondary shadow-glow-secondary" style={{ width: "24.8%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Seats Card */}
                <div className="bento-metric-card glass-card">
                  <div className="bento-icon-box bg-tertiary-alpha text-tertiary">
                    <span className="material-symbols-outlined text-3xl">hub</span>
                  </div>
                  <div className="bento-metric-details">
                    <span className="bento-metric-label">Team Members</span>
                    <h4 className="bento-metric-value">8 active seats</h4>
                    <span className="bento-metric-sub-val">2 pending invites</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Team Pulse */}
      <aside className="dashboard-sidebar custom-scrollbar">
        <div className="pulse-header">
          <span className="pulse-tag">Team Pulse</span>
          <h3 className="pulse-title">Live Updates</h3>
        </div>

        <div className="activity-timeline-container flex-1">
          <div className="timeline-activity">
            <div className="timeline-item">
              <div className="timeline-icon bg-surface-high text-primary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text">Password Changed</p>
                <span className="activity-time">Your security credentials were updated 2h ago.</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-secondary">
                <span className="material-symbols-outlined">event_upcoming</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text">Billing Renewal</p>
                <span className="activity-time">Your Pro Plan renews on Oct 12, 2026.</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-surface-high text-tertiary">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text">Team Meeting</p>
                <span className="activity-time">Quarterly roadmap review in 45 mins.</span>
              </div>
            </div>
          </div>

          <div className="upcoming-events-block">
            <div className="glass-card p-md rounded-xl shortcuts-card">
              <h5 className="section-sub-title mb-md">Quick Shortcuts</h5>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <span className="shortcut-label">Open Search</span>
                  <kbd className="kbd-key">CMD + K</kbd>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-label">New Project</span>
                  <kbd className="kbd-key">CMD + N</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-md border-t border-outline-variant/20">
          <div className="flex items-center gap-md">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-bold">JD</div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-secondary/20 flex items-center justify-center text-[10px] font-bold">MS</div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-tertiary/20 flex items-center justify-center text-[10px] font-bold">AK</div>
            </div>
            <span className="text-xs text-on-surface-variant">3 teammates online</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Settings;
