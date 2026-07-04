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
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiCpu
} from "react-icons/fi";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menu = [
    { title: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
    { title: "Tasks", path: "/tasks", icon: <FiCheckSquare /> },
    { title: "Team", path: "/team", icon: <FiUsers /> },
    { title: "Chat", path: "/chat", icon: <FiMessageSquare /> },
    { title: "Flow AI", path: "/ai-assist", icon: <FiCpu /> },
    { title: "Calendar", path: "/calendar", icon: <FiCalendar /> },
    { title: "Settings", path: "/settings", icon: <FiSettings /> },
  ];

  const localUser = localStorage.getItem("user");
  const user = localUser ? JSON.parse(localUser) : {
    name: "Alex Rivera",
    role: "Product Designer",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
  };

  return (
    <motion.aside 
      className="sidebar-container"
      initial={{ width: 260 }}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Brand Header */}
      <div className="brand-header" style={{ position: "relative", marginBottom: "30px", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <motion.svg 
            className="brand-logo" 
            width="36" 
            height="36" 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <path d="M40 60C40 48.9543 48.9543 40 60 40H140C151.046 40 160 48.9543 160 60V140C160 151.046 151.046 160 140 160H60C48.9543 160 40 151.046 40 140V60Z" fill="#5B8CFF" fillOpacity="0.15"/>
            <path d="M70 70L100 100L70 130" stroke="#5B8CFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M110 70L140 100L110 130" stroke="#5B8CFF" strokeWidth="14" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="brand-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ whiteSpace: "nowrap" }}
              >
                <h1 className="brand-title">FlowSync</h1>
                <span className="brand-subtitle">Productivity</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute",
            right: -12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--surface-high, #1a1a24)",
            border: "1px solid var(--outline, #2a2a36)",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--on-surface, #fff)",
            zIndex: 100
          }}
        >
          {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </motion.button>
      </div>

      {/* Nav Menu */}
      <nav className="nav-menu" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? "active" : ""}`}
              whileHover={{ x: isCollapsed ? 0 : 5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                borderRadius: "12px",
                cursor: "pointer",
                color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                backgroundColor: isActive ? "rgba(91, 140, 255, 0.1)" : "transparent",
                borderLeft: isActive ? "4px solid var(--primary)" : "4px solid transparent",
                position: "relative",
                justifyContent: isCollapsed ? "center" : "flex-start",
                transition: "color 0.2s, background-color 0.2s"
              }}
            >
              <div style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>
                {item.icon}
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    className="nav-label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ whiteSpace: "nowrap", fontWeight: 500, fontSize: "14px" }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>

      {/* Action CTA & User block */}
      <div className="sidebar-footer" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "20px", paddingTop: "20px", borderTop: "1px solid rgba(67, 70, 83, 0.15)" }}>
        <motion.button 
          className="new-proj-btn" 
          onClick={() => navigate("/tasks")}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(91, 140, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "var(--primary, #5b8cff)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: 600,
            overflow: "hidden"
          }}
        >
          <FiPlus size={20} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ whiteSpace: "nowrap" }}
              >
                New Project
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.div 
          className="profile-block" 
          onClick={() => navigate("/settings")}
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
            borderRadius: "12px",
            cursor: "pointer",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }}
        >
          <div className="avatar-wrapper" style={{ position: "relative", width: "38px", height: "38px", flexShrink: 0 }}>
            <img 
              src={user.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
              alt={user.name} 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--outline-variant, #434653)" }} 
            />
            <span className="status-dot active" style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", border: "2px solid var(--surface-low, #0a0a12)", backgroundColor: "var(--secondary, #00c896)" }}></span>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="profile-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <span className="profile-name" style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface, #fff)" }}>{user.name}</span>
                <span className="profile-role" style={{ fontSize: "10px", color: "var(--on-surface-variant, #8d909f)" }}>{user.role}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <motion.div style={{ color: "var(--on-surface-variant)", marginLeft: "auto" }}>
               <FiSettings size={18} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}
