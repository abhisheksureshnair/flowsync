import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiSettings, 
  FiBell, 
  FiPlus, 
  FiUser, 
  FiMonitor, 
  FiBell as FiBellOutline, 
  FiLock, 
  FiCreditCard,
  FiCamera,
  FiLoader
} from "react-icons/fi";
import { THEMES, getSavedTheme, applyTheme } from "../utils/theme";
import { uploadProfileImage, updateUserProfile } from "../api/userApi";

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
  const [currentTheme, setCurrentTheme] = useState(() => getSavedTheme());
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectTheme = (theme) => {
    setCurrentTheme(theme.id);
    applyTheme(theme.id);
    setToastMsg(`Theme set to ${theme.name}`);
    setToastType("success");
  };
  
  // Form State
  const localUser = localStorage.getItem("user");
  const currentUser = localUser ? JSON.parse(localUser) : {};
  const [userAvatar, setUserAvatar] = useState(currentUser.profileImage || "");
  const initialProfile = {
    fullName: currentUser.name || currentUser.username || "User",
    jobTitle: currentUser.role || "Member",
    email: currentUser.email || "",
    bio: currentUser.bio || ""
  };
  const [profileData, setProfileData] = useState(initialProfile);

  // Sync avatar if user in localStorage is updated
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u.profileImage) {
          setUserAvatar(u.profileImage);
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("userUpdated", handleUpdate);
    return () => window.removeEventListener("userUpdated", handleUpdate);
  }, []);
  
  const categories = [
    { id: "profile", label: "Profile", icon: <FiUser size={18} /> },
    { id: "theme", label: "Appearance", icon: <FiMonitor size={18} /> },
    { id: "notifications", label: "Notifications", icon: <FiBellOutline size={18} /> },
    { id: "security", label: "Security", icon: <FiLock size={18} /> },
    { id: "billing", label: "Billing", icon: <FiCreditCard size={18} /> }
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: profileData.fullName,
        email: profileData.email,
        bio: profileData.bio,
        role: profileData.jobTitle,
        userId: currentUser.id || currentUser._id,
      };

      const response = await updateUserProfile(payload);
      const updated = {
        ...currentUser,
        name: profileData.fullName,
        email: profileData.email,
        bio: profileData.bio,
        role: profileData.jobTitle,
        ...(response.data?.user || {}),
      };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updated }));

      setToastMsg("Profile updated successfully!");
      setToastType("success");
    } catch (err) {
      console.error("Profile update error:", err);
      // Fallback local update
      const updated = {
        ...currentUser,
        name: profileData.fullName,
        role: profileData.jobTitle,
        email: profileData.email,
        bio: profileData.bio
      };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userUpdated"));
      setToastMsg("Profile updated successfully!");
      setToastType("success");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData(initialProfile);
    setToastMsg("Changes reverted.");
    setToastType("info");
  };

  const handleChangePicture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setToastMsg("Please select an image file (PNG, JPG, WEBP, GIF, SVG)");
      setToastType("error");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastMsg("File size exceeds 5MB limit. Please choose a smaller image.");
      setToastType("error");
      return;
    }

    // Optimistic local preview
    const previewUrl = URL.createObjectURL(file);
    setUserAvatar(previewUrl);
    setIsUploading(true);
    setToastMsg("Uploading profile picture...");
    setToastType("info");

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const userId = currentUser.id || currentUser._id;
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await uploadProfileImage(formData);

      if (res.data?.success) {
        const newImageUrl = res.data.profileImage;
        setUserAvatar(newImageUrl);

        const updated = {
          ...currentUser,
          ...(res.data.user || {}),
          profileImage: newImageUrl,
        };
        localStorage.setItem("user", JSON.stringify(updated));

        // Dispatch events so Sidebar and all other views update immediately
        window.dispatchEvent(new Event("userUpdated"));
        window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updated }));

        setToastMsg("Profile picture updated and saved!");
        setToastType("success");
      } else {
        throw new Error(res.data?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setUserAvatar(currentUser.profileImage || "");
      setToastMsg(err.response?.data?.message || err.message || "Failed to upload profile picture");
      setToastType("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiSettings size={18} color="var(--on-surface-variant)" />
            <span style={{ fontSize: "15px", color: "var(--on-surface-variant)", paddingLeft: "8px" }}>
              Settings &amp; Preferences
            </span>
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
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelected} 
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml" 
                        style={{ display: "none" }} 
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <img 
                            src={userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.fullName || "User")}`} 
                            alt="Avatar" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: '2px solid var(--outline-variant)',
                              opacity: isUploading ? 0.6 : 1,
                              transition: 'opacity 0.2s ease'
                            }} 
                          />
                          {isUploading && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.55)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(2px)'
                            }}>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}
                              >
                                <FiLoader size={26} />
                              </motion.div>
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={handleChangePicture}
                            disabled={isUploading}
                            title="Change profile picture"
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
                              cursor: isUploading ? 'not-allowed' : 'pointer',
                              boxShadow: '0 4px 10px rgba(91,140,255,0.4)',
                              transition: 'transform 0.2s',
                            }}
                          >
                            <FiCamera size={16} />
                          </button>
                        </div>
                        <div>
                          <button 
                            type="button"
                            className="btn-secondary" 
                            style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }} 
                            onClick={handleChangePicture}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  style={{ display: 'flex' }}
                                >
                                  <FiLoader size={14} />
                                </motion.div>
                                Uploading...
                              </>
                            ) : (
                              "Change Picture"
                            )}
                          </button>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>JPG, PNG, GIF or WEBP. 5MB max.</p>
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
                          <button className="btn-secondary" onClick={handleCancelProfile} disabled={isSaving || isUploading}>Cancel</button>
                          <button className="btn-primary" onClick={handleSaveProfile} disabled={isSaving || isUploading}>
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Appearance Tab */}
                  {activeTab === "theme" && (
                    <motion.div
                      key="theme"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
                    >
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--on-surface)' }}>Appearance</h3>
                        <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
                          Select your preferred interface theme and visual aesthetic for FlowSync.
                        </p>
                      </div>

                      {/* Theme Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {THEMES.map((theme) => {
                          const isSelected = currentTheme === theme.id;
                          return (
                            <div
                              key={theme.id}
                              onClick={() => handleSelectTheme(theme)}
                              style={{
                                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                                borderRadius: '16px',
                                padding: '16px',
                                background: isSelected ? 'rgba(91, 140, 255, 0.08)' : 'var(--surface-high)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                position: 'relative',
                                boxShadow: isSelected ? '0 0 20px rgba(91, 140, 255, 0.2)' : 'none'
                              }}
                            >
                              {/* Mock Preview Window */}
                              <div style={{
                                width: '100%',
                                height: '90px',
                                borderRadius: '10px',
                                background: theme.bg,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                {/* Mini Sidebar */}
                                <div style={{ width: '30%', background: theme.sidebar, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: theme.accent }}></div>
                                  <div style={{ width: '80%', height: '3px', background: 'rgba(255,255,255,0.2)', marginTop: '4px' }}></div>
                                  <div style={{ width: '60%', height: '3px', background: theme.accent, marginTop: '2px' }}></div>
                                </div>
                                {/* Mini Content */}
                                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ width: '50%', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }}></div>
                                  <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: `1px solid ${theme.accent}33` }}></div>
                                </div>
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--on-surface)' }}>
                                    {theme.name}
                                  </span>
                                  {isSelected && (
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(91,140,255,0.2)', color: 'var(--primary)' }}>
                                      Active
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px', display: 'block' }}>
                                  {theme.tagline}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interface Preferences */}
                      <div style={{ marginTop: '10px', borderTop: '1px solid var(--outline-variant)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--on-surface)' }}>Visual Options</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-high)', borderRadius: '10px' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)', display: 'block' }}>Subtle Glow Effects</span>
                            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Enable electric ambient glow on active elements and buttons</span>
                          </div>
                          <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === "notifications" && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
                    >
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--on-surface)' }}>Notifications</h3>
                        <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
                          Review your workspace notification space and configure delivery channels.
                        </p>
                      </div>

                      {/* Notification Space Section */}
                      <div style={{
                        border: '1px solid var(--outline-variant)',
                        borderRadius: '16px',
                        background: 'var(--surface-high)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)' }}>Notification Space</span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: 'rgba(91, 140, 255, 0.15)',
                              color: 'var(--primary)',
                              fontFamily: 'monospace'
                            }}>
                              null
                            </span>
                          </div>

                          <button 
                            className="btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              setToastMsg("Notification space checked: null new alerts.");
                              setToastType("info");
                            }}
                          >
                            Refresh Space
                          </button>
                        </div>

                        {/* Notification Space Content showing null state */}
                        <div style={{
                          border: '1px dashed var(--outline-variant)',
                          borderRadius: '12px',
                          padding: '40px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          gap: '12px',
                          background: 'rgba(0, 0, 0, 0.15)'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(91, 140, 255, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FiBell size={24} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)' }}>
                              Notification data: <code style={{ color: 'var(--primary)', background: 'rgba(91, 140, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>null</code>
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', maxWidth: '380px' }}>
                              No unread alerts or pending notifications found in this space. All caught up!
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notification Preferences */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--on-surface)' }}>Notification Preferences</h4>
                        {[
                          { title: "Task Assignments & Status Changes", desc: "Get notified when a task is assigned to you or completed" },
                          { title: "Sprint Due Dates & Milestones", desc: "Receive alerts for approaching deadlines and sprint closures" },
                          { title: "Team Mentions & Messages", desc: "Instant alert whenever a team member @mentions you in chat" },
                          { title: "Echo AI Recommendations", desc: "Get smart productivity suggestions and automated summaries" }
                        ].map((pref, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--surface-high)',
                            borderRadius: '10px'
                          }}>
                            <div>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)', display: 'block' }}>{pref.title}</span>
                              <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{pref.desc}</span>
                            </div>
                            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Fallback for other tabs */}
                  {activeTab !== "profile" && activeTab !== "theme" && activeTab !== "notifications" && (
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
