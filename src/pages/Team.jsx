import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiSearch, 
  FiBell, 
  FiUserPlus, 
  FiUsers,
  FiMessageCircle,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiFolder,
  FiX
} from "react-icons/fi";
import { allUser } from "../api/userApi";
import { allTask } from "../api/taskApi";
import { TeamCardSkeleton } from "../components/ui/Skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }
};

function Team() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasksTab, setMemberTasksTab] = useState("not-completed"); // 'not-completed', 'completed', 'all'

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  
  const [inviteData, setInviteData] = useState({ email: "", role: "Member" });

  useEffect(() => {
    const fetchTeamAndTasks = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.allSettled([
          allUser(),
          allTask()
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value?.status === 200 && usersRes.value?.data?.users) {
          const currentLoggedInUser = JSON.parse(localStorage.getItem("user")) || {};
          const currentId = currentLoggedInUser._id || currentLoggedInUser.id;
          const currentEmail = (currentLoggedInUser.email || "").toLowerCase();

          // Exclude currently logged in user from team members list
          const teammates = usersRes.value.data.users.filter(u => {
            const uId = u._id || u.id;
            const uEmail = (u.email || "").toLowerCase();
            if (currentId && uId === currentId) return false;
            if (currentEmail && uEmail === currentEmail) return false;
            return true;
          });

          const mapped = teammates.map((u, i) => ({
            id: u._id || `mem-${i}`,
            name: u.name || u.username || "Team Member",
            username: u.username || "",
            email: u.email || "",
            role: u.role || "Member",
            avatar: u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.username || "User")}`,
            team: u.team || "",
            status: "online"
          }));
          setTeamMembers(mapped);
        }

        if (tasksRes.status === "fulfilled" && tasksRes.value?.status === 200) {
          const rawTasks = tasksRes.value.data?.data || tasksRes.value.data?.tasks || [];
          setTasks(Array.isArray(rawTasks) ? rawTasks : []);
        }
      } catch (err) {
        console.error("Failed to fetch team data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamAndTasks();
  }, []);

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.username && m.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get tasks for a given member
  const getTasksForMember = (memberId) => {
    if (!memberId) return [];
    return tasks.filter(task => {
      if (Array.isArray(task.assignedTo)) {
        return task.assignedTo.some(a => {
          const aId = typeof a === "object" ? (a._id || a.id) : a;
          return aId === memberId;
        });
      }
      const aId = typeof task.assignedTo === "object" ? (task.assignedTo?._id || task.assignedTo?.id) : task.assignedTo;
      return aId === memberId;
    });
  };

  const selectedMemberTasks = useMemo(() => {
    if (!selectedMember) return [];
    return getTasksForMember(selectedMember.id);
  }, [selectedMember, tasks]);

  const completedTasks = useMemo(() => {
    return selectedMemberTasks.filter(t => t.status === "Completed");
  }, [selectedMemberTasks]);

  const notCompletedTasks = useMemo(() => {
    return selectedMemberTasks.filter(t => t.status !== "Completed");
  }, [selectedMemberTasks]);

  const displayedTasks = useMemo(() => {
    if (memberTasksTab === "completed") return completedTasks;
    if (memberTasksTab === "not-completed") return notCompletedTasks;
    return selectedMemberTasks;
  }, [memberTasksTab, completedTasks, notCompletedTasks, selectedMemberTasks]);

  const handleOpenChat = (memberId) => {
    navigate("/chat", { state: { userId: memberId } });
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteData.email.trim()) return;

    const namePart = inviteData.email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newMember = {
      id: `mem-${Date.now()}`,
      name: name,
      username: namePart.toLowerCase(),
      email: inviteData.email,
      role: inviteData.role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      team: "",
      status: "online"
    };

    setTeamMembers([newMember, ...teamMembers]);
    setInviteModalOpen(false);
    setInviteData({ email: "", role: "Member" });
    setToastMsg(`Invitation sent to ${inviteData.email}`);
    setToastType("success");
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiUsers size={18} color="var(--on-surface-variant)" />
            <span style={{ fontSize: "15px", color: "var(--on-surface-variant)", paddingLeft: "8px" }}>
              Team Members
            </span>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setInviteModalOpen(true)}>
              <FiUserPlus size={16} style={{ marginRight: '6px' }} />
              Invite Member
            </button>
            <div className="header-divider" style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
            <button className="icon-btn" onClick={() => { setToastMsg("No new notifications"); setToastType("info"); }}>
              <FiBell size={20} />
            </button>
          </div>
        </header>

        <div className="dashboard-scroll-area custom-scrollbar">
          <motion.div 
            className="dashboard-canvas"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1240px', padding: '0 20px', gap: '28px' }}
          >
            {/* Header Block */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', margin: 0, letterSpacing: '-0.5px' }}>Team Members</h2>
                  {!isLoading && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'rgba(91, 140, 255, 0.15)',
                      color: 'var(--primary)',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(91, 140, 255, 0.25)'
                    }}>
                      {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
                  Click any team member card to view their assigned tasks and progress.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--surface-high)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  gap: '8px'
                }}>
                  <FiSearch size={14} color="var(--on-surface-variant)" />
                  <input
                    type="text"
                    placeholder="Filter members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--on-surface)',
                      fontSize: '13px',
                      outline: 'none',
                      width: '160px'
                    }}
                  />
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setInviteModalOpen(true)}>
                  <FiUserPlus size={16} /> Invite Member
                </button>
              </div>
            </motion.div>

            {/* Compact Team Cards Grid */}
            <motion.div 
              variants={itemVariants} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: !isLoading && filteredMembers.length === 0 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px' 
              }}
            >
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                    <TeamCardSkeleton key={idx} />
                  ))
                ) : filteredMembers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(91,140,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiUsers size={28} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                      {searchQuery ? "No Matching Teammates" : "No Team Members Yet"}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--on-surface-variant)', margin: 0, maxWidth: '380px' }}>
                      {searchQuery 
                        ? `No team members found matching "${searchQuery}". Try a different keyword.` 
                        : "Invite teammates to collaborate on projects and assign tasks."}
                    </p>
                    {!searchQuery && (
                      <button className="btn-primary" onClick={() => setInviteModalOpen(true)} style={{ marginTop: '8px' }}>
                        <FiUserPlus size={16} style={{ marginRight: '6px' }} />
                        Invite Member
                      </button>
                    )}
                  </motion.div>
                ) : (
                  filteredMembers.map((member) => {
                    const mTasks = getTasksForMember(member.id);
                    const completedCount = mTasks.filter(t => t.status === "Completed").length;
                    const notCompletedCount = mTasks.length - completedCount;
                    const isSelected = selectedMember?.id === member.id;

                    return (
                      <motion.div 
                        layout
                        key={member.id} 
                        className="glass-card"
                        onClick={() => setSelectedMember(prev => prev?.id === member.id ? null : member)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -3, borderColor: isSelected ? 'var(--primary)' : 'rgba(91, 140, 255, 0.45)', boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4)' }}
                        transition={{ duration: 0.2 }}
                        style={{ 
                          padding: '16px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          gap: '12px',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          position: 'relative',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--glass-border)',
                          background: isSelected ? 'rgba(91, 140, 255, 0.12)' : 'var(--surface-high)',
                          boxShadow: isSelected ? '0 0 0 3px rgba(91, 140, 255, 0.25), 0 10px 26px rgba(0, 0, 0, 0.45)' : 'none',
                          transition: 'border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          {/* Compact Avatar with Online Dot */}
                          <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                objectFit: 'cover', 
                                border: isSelected ? '2px solid var(--primary)' : '1.5px solid rgba(255,255,255,0.1)',
                                boxShadow: isSelected ? '0 0 10px rgba(91, 140, 255, 0.5)' : 'none'
                              }} 
                            />
                            <span style={{
                              position: 'absolute',
                              bottom: '1px',
                              right: '1px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              border: '2px solid var(--surface-low, #0f172a)',
                              backgroundColor: member.status === 'online' ? 'var(--secondary)' : 'var(--outline)'
                            }} />
                          </div>

                          {/* Member Info */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h4 style={{ 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                margin: 0, 
                                color: isSelected ? 'var(--primary)' : 'var(--on-surface)', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}>
                                {member.name}
                              </h4>
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 600, 
                                padding: '1px 6px', 
                                borderRadius: '10px',
                                background: member.role === 'Admin' ? 'rgba(255, 184, 116, 0.15)' : 'rgba(91, 140, 255, 0.12)',
                                color: member.role === 'Admin' ? 'var(--tertiary)' : 'var(--primary)',
                                flexShrink: 0
                              }}>
                                {member.role}
                              </span>
                            </div>

                            {member.username && (
                              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                @{member.username}
                              </p>
                            )}

                            {/* Task completion chips */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FiCheckCircle size={11} /> {completedCount}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--outline)' }}>•</span>
                              <span style={{ fontSize: '11px', color: notCompletedCount > 0 ? 'var(--tertiary)' : 'var(--outline)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FiClock size={11} /> {notCompletedCount} active
                              </span>
                              {isSelected && (
                                <span style={{ marginLeft: 'auto', fontSize: '10.5px', fontWeight: 600, color: 'var(--primary)' }}>
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Chat Icon Button */}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChat(member.id);
                          }}
                          title={`Chat with ${member.name}`}
                          style={{
                            padding: '8px',
                            borderRadius: '10px',
                            background: isSelected ? 'var(--primary)' : 'rgba(91, 140, 255, 0.1)',
                            color: isSelected ? '#ffffff' : 'var(--primary)',
                            border: '1px solid rgba(91, 140, 255, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FiMessageCircle size={15} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Selected Member Tasks & Details Drawer */}
      <AnimatePresence>
        {selectedMember && (
          <>
            {/* Drawer Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                zIndex: 9998
              }}
            />

            {/* Right-side Drawer Panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '450px',
                maxWidth: '92vw',
                zIndex: 9999,
                background: 'var(--surface-low, #0b1120)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)' }}>
                    Team Member Details
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--on-surface-variant)' }}>
                    Assigned tasks and activity breakdown
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="icon-btn"
                  title="Close Drawer"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--on-surface-variant)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div
                className="custom-scrollbar"
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {/* Member Profile Header */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                      <img 
                        src={selectedMember.avatar} 
                        alt={selectedMember.name} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(91, 140, 255, 0.35)' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        border: '2px solid var(--surface-low, #0f172a)',
                        backgroundColor: selectedMember.status === 'online' ? 'var(--secondary)' : 'var(--outline)'
                      }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedMember.name}
                        </h3>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          background: selectedMember.role === 'Admin' ? 'rgba(255, 184, 116, 0.15)' : 'rgba(91, 140, 255, 0.15)',
                          color: selectedMember.role === 'Admin' ? 'var(--tertiary)' : 'var(--primary)',
                          flexShrink: 0
                        }}>
                          {selectedMember.role}
                        </span>
                      </div>
                      {selectedMember.username && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          @{selectedMember.username}
                        </p>
                      )}
                      {selectedMember.email && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--outline)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedMember.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chat Action */}
                  <button 
                    className="btn-primary" 
                    onClick={() => handleOpenChat(selectedMember.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '7px', 
                      padding: '9px 16px', 
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      flexShrink: 0
                    }}
                  >
                    <FiMessageCircle size={15} />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Task Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Not Completed Tasks Stat */}
                  <div 
                    onClick={() => setMemberTasksTab("not-completed")}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: memberTasksTab === "not-completed" ? 'rgba(255, 184, 116, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: memberTasksTab === "not-completed" ? '1.5px solid var(--tertiary)' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 184, 116, 0.15)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiClock size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>
                        {notCompletedTasks.length}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--outline)', marginTop: '2px' }}>
                        Not Completed
                      </div>
                    </div>
                  </div>

                  {/* Completed Tasks Stat */}
                  <div 
                    onClick={() => setMemberTasksTab("completed")}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: memberTasksTab === "completed" ? 'rgba(65, 238, 130, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: memberTasksTab === "completed" ? '1.5px solid var(--secondary)' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(65, 238, 130, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>
                        {completedTasks.length}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--outline)', marginTop: '2px' }}>
                        Completed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  {[
                    { id: "not-completed", label: `Not Completed (${notCompletedTasks.length})` },
                    { id: "completed", label: `Completed (${completedTasks.length})` },
                    { id: "all", label: `All Tasks (${selectedMemberTasks.length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setMemberTasksTab(tab.id)}
                      style={{
                        background: memberTasksTab === tab.id ? 'var(--primary)' : 'transparent',
                        color: memberTasksTab === tab.id ? '#ffffff' : 'var(--on-surface-variant)',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {displayedTasks.length === 0 ? (
                    <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--outline)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <FiCheckCircle size={26} style={{ opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '13px' }}>
                        {memberTasksTab === "completed" 
                          ? "No completed tasks found for this member." 
                          : memberTasksTab === "not-completed" 
                            ? "No pending tasks! All caught up." 
                            : "No tasks assigned to this member."}
                      </p>
                    </div>
                  ) : (
                    displayedTasks.map(task => {
                      const isDone = task.status === "Completed";
                      return (
                        <div
                          key={task._id || task.id}
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderLeft: isDone ? '3px solid var(--secondary)' : '3px solid var(--primary)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)' }}>
                              {task.title}
                            </span>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isDone ? 'rgba(65, 238, 130, 0.12)' : 'rgba(91, 140, 255, 0.12)',
                              color: isDone ? 'var(--secondary)' : 'var(--primary)',
                              flexShrink: 0
                            }}>
                              {task.status || "Todo"}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '11.5px', color: 'var(--outline)' }}>
                            {task.priority && (
                              <span style={{ color: task.priority === 'High' ? 'var(--error)' : 'var(--outline)', fontWeight: 500 }}>
                                Priority: {task.priority}
                              </span>
                            )}
                            {task.project && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiFolder size={11} /> {task.project}
                              </span>
                            )}
                            {task.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiCalendar size={11} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(91, 140, 255, 0.2)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary)' }}>Invited members will receive an email to join your FlowSync workspace.</p>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. sarah@company.com"
              value={inviteData.email}
              onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
              className="form-input" 
              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }} 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Workspace Role</label>
            <select 
              value={inviteData.role}
              onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
              className="form-input" 
              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
            >
              <option>Member</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setInviteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Send Invite</button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Team;

