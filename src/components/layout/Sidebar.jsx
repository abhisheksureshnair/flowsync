import React from "react";
import "./sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Tasks",
      path: "/tasks",
      icon: "assignment",
    },
    {
      title: "Team",
      path: "/team",
      icon: "group",
    },
    {
      title: "Chat",
      path: "/chat",
      icon: "chat",
    },
    {
      title: "Calendar",
      path: "/calendar",
      icon: "calendar_today",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: "settings",
    },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="brand-header">
        <svg className="brand-logo" width="36" height="36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 60C40 48.9543 48.9543 40 60 40H140C151.046 40 160 48.9543 160 60V140C160 151.046 151.046 160 140 160H60C48.9543 160 40 151.046 40 140V60Z" fill="#5B8CFF" fillOpacity="0.15"/>
          <path d="M70 70L100 100L70 130" stroke="#5B8CFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M110 70L140 100L110 130" stroke="#5B8CFF" strokeWidth="14" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="brand-info">
          <h1 className="brand-title">FlowSync</h1>
          <span className="brand-subtitle">Productivity Workspace</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="nav-menu">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.title}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              <span className="nav-label">{item.title}</span>
            </div>
          );
        })}
      </nav>

      {/* Action CTA & User block */}
      <div className="sidebar-footer">
        <button className="new-proj-btn" onClick={() => navigate("/tasks")}>
          <span className="material-symbols-outlined">add</span>
          New Project
        </button>

        <div className="profile-block" onClick={() => navigate("/settings")}>
          <div className="avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
              alt="Alex Rivera" 
              className="profile-avatar" 
            />
            <span className="status-dot active"></span>
          </div>
          <div className="profile-info">
            <span className="profile-name">Alex Rivera</span>
            <span className="profile-role">Product Designer</span>
          </div>
          <span className="material-symbols-outlined settings-gear">more_vert</span>
        </div>
      </div>
    </aside>
  );
}
