import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiSearch, 
  FiBell, 
  FiPlus, 
  FiCheckCircle, 
  FiFolder, 
  FiUsers, 
  FiZap,
  FiTrendingUp,
  FiClock,
  FiMessageSquare,
  FiLayout,
  FiSettings
} from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

function Dashboard() {
  const navigate = useNavigate();
  
  const [toastMsg, setToastMsg] = useState("");
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input type="text" placeholder="Search tasks, docs, or people..." />
          </div>
          <div className="header-actions" style={{ position: 'relative' }}>
            <button className="btn-secondary" onClick={() => setQuickActionsOpen(true)}>Quick Actions</button>
            <button className="btn-primary" onClick={() => navigate("/tasks")}>
              <FiPlus size={16} style={{ marginRight: '6px' }} />
              Create
            </button>
            <div className="header-divider" style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
            <button className="icon-btn" onClick={() => setNotificationsOpen(!isNotificationsOpen)}>
              <FiBell size={20} />
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="glass-card"
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', padding: '16px', zIndex: 100 }}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Recent Alerts</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ padding: '6px', background: 'rgba(91,140,255,0.1)', color: 'var(--primary)', borderRadius: '50%' }}>
                        <FiCheckCircle size={14} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface)' }}>System update successful.</p>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>2m ago</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="dashboard-scroll-area custom-scrollbar">
          <motion.div 
            className="dashboard-canvas"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1400px', padding: '0 20px' }}
          >
            {/* Hero Section */}
            <motion.section variants={itemVariants} className="dashboard-hero" style={{ gridTemplateColumns: '1fr', display: 'flex', justifyContent: 'space-between' }}>
              <div className="welcome-text">
                <h2 className="welcome-headline" style={{ fontSize: '36px' }}>Welcome back, Alex.</h2>
                <p className="welcome-desc" style={{ fontSize: '16px', opacity: 0.8, marginTop: '8px' }}>
                  You've completed <span className="highlight-text font-bold" style={{ color: 'var(--primary)' }}>85%</span> of your weekly goals. 
                  Your team is waiting for review on 3 pending items.
                </p>
              </div>
              
              <div className="active-sprint-card glass-card" style={{ width: '320px', padding: '20px', cursor: 'pointer' }} onClick={() => navigate("/tasks")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '50%' }}>
                     <FiTrendingUp size={24} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, letterSpacing: '1px' }}>Active Sprint</span>
                    <h4 style={{ fontSize: '16px', color: 'var(--on-surface)', margin: '4px 0' }}>Nova Design System</h4>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Due in 2 days</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Stats Grid */}
            <motion.section variants={itemVariants} className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '10px' }}>
              <div className="stat-card glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Tasks Completed</span>
                   <div style={{ padding: '8px', background: 'rgba(65, 238, 130, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
                     <FiCheckCircle size={20} />
                   </div>
                </div>
                <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>124</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>+12.5%</span>
                  <span style={{ color: 'var(--outline)' }}>from last week</span>
                </div>
              </div>

              <div className="stat-card glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Active Projects</span>
                   <div style={{ padding: '8px', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                     <FiFolder size={20} />
                   </div>
                </div>
                <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>12</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>In Progress</span>
                </div>
              </div>

              <div className="stat-card glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Team Members</span>
                   <div style={{ padding: '8px', background: 'rgba(255, 184, 116, 0.1)', borderRadius: '8px', color: 'var(--tertiary)' }}>
                     <FiUsers size={20} />
                   </div>
                </div>
                <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>48</h3>
                <div className="team-avatars" style={{ display: 'flex', marginLeft: '4px' }}>
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Team 1" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--surface)', marginLeft: '-8px' }} />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80" alt="Team 2" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--surface)', marginLeft: '-8px' }} />
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--surface)', marginLeft: '-8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>+46</div>
                </div>
              </div>

              <div className="stat-card glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                   <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Productivity</span>
                   <div style={{ padding: '8px', background: 'rgba(65, 238, 130, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
                     <FiZap size={20} />
                   </div>
                </div>
                <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>94%</h3>
                <div className="productivity-progress" style={{ height: '6px', background: 'var(--surface-high)', borderRadius: '3px', overflow: 'hidden', marginTop: '12px' }}>
                  <div className="productivity-bar" style={{ width: "94%", height: '100%', background: 'var(--secondary)', borderRadius: '3px', boxShadow: '0 0 10px rgba(65, 238, 130, 0.5)' }}></div>
                </div>
              </div>
            </motion.section>

            {/* Main Content Area */}
            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '20px' }}>
              
              {/* Recent Activity List */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Recent Activity</h3>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setToastMsg("Loading activity feed...")}>View All</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(91, 140, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheckCircle size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Jordan</strong> completed <span style={{ color: 'var(--primary)' }}>Styleguide v2</span> in Project Nova</p>
                      <span style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={12} /> 2 hours ago
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 184, 116, 0.1)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiMessageSquare size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Elena</strong> left a comment on <span style={{ color: 'var(--primary)' }}>Auth Flow Designs</span></p>
                      <span style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={12} /> 5 hours ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Pulse */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(20, 26, 47, 0.9), rgba(91, 140, 255, 0.1))' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Weekly Pulse</h3>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '24px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="var(--primary)" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="37.68" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--on-surface)' }}>85%</span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Target</span>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>You're almost there!</h4>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>Complete 3 more priority tasks to reach your weekly goal.</p>
                </div>
              </div>
            </motion.section>
            
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      <Modal isOpen={isQuickActionsOpen} onClose={() => setQuickActionsOpen(false)} title="Quick Actions">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            onClick={() => { setQuickActionsOpen(false); navigate("/tasks"); }}
            className="glass-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', color: 'var(--on-surface)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(91,140,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle size={24} />
            </div>
            <span style={{ fontWeight: 600 }}>Create Task</span>
          </button>
          
          <button 
            onClick={() => { setQuickActionsOpen(false); navigate("/team"); }}
            className="glass-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', color: 'var(--on-surface)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,184,116,0.1)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers size={24} />
            </div>
            <span style={{ fontWeight: 600 }}>Invite Team</span>
          </button>
          
          <button 
            onClick={() => { setQuickActionsOpen(false); navigate("/chat"); }}
            className="glass-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', color: 'var(--on-surface)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(65,238,130,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMessageSquare size={24} />
            </div>
            <span style={{ fontWeight: 600 }}>New Message</span>
          </button>

          <button 
            onClick={() => { setQuickActionsOpen(false); navigate("/settings"); }}
            className="glass-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', color: 'var(--on-surface)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--outline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiSettings size={24} />
            </div>
            <span style={{ fontWeight: 600 }}>Settings</span>
          </button>
        </div>
      </Modal>

      <Toast message={toastMsg} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Dashboard;
