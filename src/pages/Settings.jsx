import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiSearch, 
  FiBell, 
  FiPlus, 
  FiUser, 
  FiMonitor, 
  FiBell as FiBellOutline, 
  FiLock, 
  FiCreditCard,
  FiCamera
} from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  
  // Form State
  const initialProfile = {
    fullName: "Alex Rivera",
    jobTitle: "Product Lead",
    email: "alex.rivera@flowsync.io",
    bio: "Building the next generation of productivity tools. Obsessed with flow states and clean UI."
  };
  const [profileData, setProfileData] = useState(initialProfile);
  
  const categories = [
    { id: "profile", label: "Profile", icon: <FiUser size={18} /> },
    { id: "theme", label: "Appearance", icon: <FiMonitor size={18} /> },
    { id: "notifications", label: "Notifications", icon: <FiBellOutline size={18} /> },
    { id: "security", label: "Security", icon: <FiLock size={18} /> },
    { id: "billing", label: "Billing", icon: <FiCreditCard size={18} /> }
  ];

  const handleSaveProfile = () => {
    setToastMsg("Profile updated successfully!");
    setToastType("success");
  };

  const handleCancelProfile = () => {
    setProfileData(initialProfile);
    setToastMsg("Changes reverted.");
    setToastType("info");
  };

  const handleChangePicture = () => {
    setToastMsg("File upload dialog opened...");
    setToastType("info");
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input type="text" placeholder="Search settings..." />
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => { setToastMsg("Quick actions opened"); setToastType("info"); }}>Quick Actions</button>
            <button className="btn-primary" onClick={() => navigate("/tasks")}>
              <FiPlus size={16} style={{ marginRight: '6px' }} />
              Create
            </button>
            <div className="header-divider" style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
            <button className="icon-btn" onClick={() => { setToastMsg("Notifications panel"); setToastType("info"); }}><FiBell size={20} /></button>
          </div>
        </header>

        <div className="dashboard-scroll-area custom-scrollbar">
          <motion.div 
            className="dashboard-canvas"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1000px', padding: '0 20px', gap: '30px' }}
          >
            {/* Header Block */}
            <motion.div variants={itemVariants}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 8px 0' }}>Settings</h2>
              <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', margin: 0 }}>Manage your workspace preferences and account details.</p>
            </motion.div>

            {/* Layout Grid */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px' }}>
              
              {/* Left Sidebar (Tabs) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveTab(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: activeTab === cat.id ? 'var(--surface-high)' : 'transparent',
                      color: activeTab === cat.id ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: activeTab === cat.id ? 600 : 500,
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ color: activeTab === cat.id ? 'var(--primary)' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}>
                      {cat.icon}
                    </div>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Right Content Area */}
              <div className="glass-card" style={{ padding: '32px', minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                    >
                      <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Public Profile</h3>

                      {/* Avatar Upload */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                            alt="Avatar" 
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--outline-variant)' }} 
                          />
                          <button 
                            onClick={handleChangePicture}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              background: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(91,140,255,0.4)'
                            }}
                          >
                            <FiCamera size={16} />
                          </button>
                        </div>
                        <div>
                          <button className="btn-secondary" style={{ marginBottom: '8px' }} onClick={handleChangePicture}>Change Picture</button>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>JPG, GIF or PNG. 1MB max.</p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Full Name</label>
                            <input 
                              type="text" 
                              value={profileData.fullName} 
                              onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                              className="form-input" 
                              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }} 
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Job Title</label>
                            <input 
                              type="text" 
                              value={profileData.jobTitle} 
                              onChange={e => setProfileData({...profileData, jobTitle: e.target.value})}
                              className="form-input" 
                              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Email Address</label>
                          <input 
                            type="email" 
                            value={profileData.email} 
                            onChange={e => setProfileData({...profileData, email: e.target.value})}
                            className="form-input" 
                            style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Bio</label>
                          <textarea 
                            value={profileData.bio} 
                            onChange={e => setProfileData({...profileData, bio: e.target.value})}
                            rows={4}
                            className="form-input custom-scrollbar" 
                            style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none', resize: 'vertical' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                          <button className="btn-secondary" onClick={handleCancelProfile}>Cancel</button>
                          <button className="btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab !== "profile" && (
                    <motion.div
                      key="other"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--on-surface-variant)', flexDirection: 'column', gap: '16px' }}
                    >
                      <div style={{ padding: '20px', background: 'var(--surface-high)', borderRadius: '50%', color: 'var(--outline)' }}>
                        <FiMonitor size={32} />
                      </div>
                      <p>This section is under construction.</p>
                      <button className="btn-secondary" onClick={() => { setToastMsg("Feature coming soon!"); setToastType("info"); }}>Notify me when ready</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Settings;
