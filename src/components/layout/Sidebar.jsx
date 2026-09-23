import React, { useState } from "react";
import "./sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiGrid, 
  FiCheckSquare, 
  FiUsers, 
  FiMessageSquare, 
  FiCalendar, 
  FiSettings,
  FiChevronRight,
  FiSidebar,
  FiPlus,
  FiCpu,
  FiLogOut
} from "react-icons/fi";

import flowsyncIcon from "../../assets/flowsync-icon.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navSections = [
    {
      key: "workspace",
      title: "WORKSPACE",
      items: [
        { title: "Dashboard", path: "/dashboard", icon: <FiGrid size={20} /> },
        { title: "Tasks", path: "/tasks", icon: <FiCheckSquare size={20} /> },
        { title: "Team", path: "/team", icon: <FiUsers size={20} /> },
        { title: "Chat", path: "/chat", icon: <FiMessageSquare size={20} /> },
      ]
    },
    {
      key: "tools",
      title: "TOOLS",
      items: [
        { 
          title: "Flow AI", 
          path: "/ai-assist", 
          icon: <FiCpu size={20} />, 
          isSpecial: true,
          badge: "NEW" 
        },
        { title: "Calendar", path: "/calendar", icon: <FiCalendar size={20} /> },
      ]
    },
    {
      key: "system",
      title: "SYSTEM",
      items: [
        { title: "Settings", path: "/settings", icon: <FiSettings size={20} /> },
      ]
    }
  ];

  const localUser = localStorage.getItem("user");
  const user = localUser ? JSON.parse(localUser) : {
    name: "Test",
    role: "Member",
    profileImage: ""
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  return (
    <aside 
      className={`sidebar-container ${isCollapsed ? "collapsed" : "expanded"}`}
      aria-label="Sidebar navigation"
    >
      {/* Brand Header */}
      <div className="brand-header">
        <div 
          className="brand-identity"
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
            } else {
              navigate("/dashboard");
            }
          }}
          title={isCollapsed ? "Expand sidebar" : "FlowSync Dashboard"}
        >
          <img 
            src={flowsyncIcon}
            alt="FlowSync"
            className="brand-logo" 
          />
          
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div 
                className="brand-info"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <span className="brand-title">FlowSync</span>
                <span className="brand-subtitle">PRODUCTIVITY</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Header Collapse / Expand Action */}
        <button
          className="header-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight size={16} /> : <FiSidebar size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="nav-sections-container custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.key} className="nav-section">
            {!isCollapsed && (
              <span className="nav-section-title">{section.title}</span>
            )}

            <div className="nav-section-items">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <div
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className={`nav-item ${isActive ? "active" : ""} ${item.isSpecial ? "special-ai" : ""}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(item.path);
                      }
                    }}
                  >
                    {/* Active Accent Bar */}
                    {isActive && <span className="active-indicator" />}

                    {/* Icon */}
                    <div className={`nav-icon-wrapper ${item.isSpecial ? "ai-icon-wrapper" : ""}`}>
                      {item.icon}
                    </div>
                    
                    {/* Label & Optional Badge */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div 
                          className="nav-label-wrapper"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18 }}
                        >
                          <span className="nav-label">{item.title}</span>
                          {item.badge && (
                            <span className="special-badge">{item.badge}</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                      <div className="sidebar-tooltip" role="tooltip">
                        <span>{item.title}</span>
                        {item.badge && <span className="tooltip-badge">{item.badge}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Flexible Spacer */}
      <div className="sidebar-spacer" />

      {/* Sidebar Footer: New Project CTA & User Profile */}
      <div className="sidebar-footer">
        {/* New Project Button */}
        <button 
          className="new-project-btn" 
          onClick={() => navigate("/tasks")}
          title={isCollapsed ? "New Project" : ""}
          aria-label="Create new project"
        >
          <span className="new-project-icon">
            <FiPlus size={18} />
          </span>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                className="new-project-text"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
              >
                New Project
              </motion.span>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="sidebar-tooltip" role="tooltip">
              <span>New Project</span>
            </div>
          )}
        </button>

        {/* User Profile Card */}
        <div 
          className="user-profile-card"
          onClick={() => navigate("/settings")}
          title={isCollapsed ? `${user.name || "User"} (${user.role || "Member"})` : ""}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/settings");
            }
          }}
        >
          <div className="avatar-wrapper">
            <img 
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`} 
              alt={user.name || "User"} 
              className="user-avatar"
            />
            <span className="status-indicator active" />
          </div>
          
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div 
                className="profile-details"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
              >
                <span className="profile-name">{user.name || "Test"}</span>
                <span className="profile-role">{user.role || "Member"}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button 
              className="profile-logout-btn" 
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              <FiLogOut size={16} />
            </button>
          )}

          {isCollapsed && (
            <div className="sidebar-tooltip" role="tooltip">
              <span>{user.name || "User"}</span>
              <span className="tooltip-subtext">{user.role || "Member"}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

