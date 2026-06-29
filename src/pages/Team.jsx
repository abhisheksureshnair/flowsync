import React, { useState } from "react";
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
  FiFilter, 
  FiMoreHorizontal,
  FiMessageCircle,
  FiMail,
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const INITIAL_TEAM = [
  {
    id: "mem-1",
    name: "Alex Rivera",
    role: "Senior Product Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    status: "online",
    changeLabel: "Weekly Velocity",
    changeVal: "+12%",
    projects: 4
  },
  {
    id: "mem-2",
    name: "Sarah Chen",
    role: "Lead Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    status: "online",
    changeLabel: "Code Output",
    changeVal: "+8%",
    projects: 6
  },
  {
    id: "mem-3",
    name: "Marcus Thorne",
    role: "Backend Architect",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    status: "away",
    changeLabel: "Uptime Contribution",
    changeVal: "Stable",
    projects: 3
  },
  {
    id: "mem-4",
    name: "Elena Rostova",
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    status: "offline",
    changeLabel: "Model Accuracy",
    changeVal: "+2%",
    projects: 2
  },
  {
    id: "mem-5",
    name: "Jordan Lee",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    status: "online",
    changeLabel: "Sprint Completion",
    changeVal: "94%",
    projects: 8
  }
];

function Team() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM);
  
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const [inviteData, setInviteData] = useState({ email: "", role: "Member" });

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if(!inviteData.email.trim()) return;

    // Determine name from email
    const namePart = inviteData.email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newMember = {
      id: `mem-${Date.now()}`,
      name: name,
      role: inviteData.role,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
      status: "away",
      changeLabel: "Pending",
      changeVal: "-",
      projects: 0
    };

    setTeamMembers([newMember, ...teamMembers]);
    setInviteModalOpen(false);
    setInviteData({ email: "", role: "Member" });
    setToastMsg(`Invitation sent to ${inviteData.email}`);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input type="text" placeholder="Search team members..." />
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setToastMsg("Quick actions menu")}>Quick Actions</button>
            <button className="btn-primary" onClick={() => setInviteModalOpen(true)}>
              <FiUserPlus size={16} style={{ marginRight: '6px' }} />
              Invite
            </button>
            <div className="header-divider" style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
            <button className="icon-btn" onClick={() => setToastMsg("No new notifications")}><FiBell size={20} /></button>
          </div>
        </header>

        <div className="dashboard-scroll-area custom-scrollbar">
          <motion.div 
            className="dashboard-canvas"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1200px', padding: '0 20px', gap: '30px' }}
          >
            {/* Header Block */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 8px 0' }}>Core Team</h2>
                <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', margin: 0 }}>Manage your workspace collaborators and their permissions.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setToastMsg("Filter options")}>
                  <FiFilter size={16} /> Filter
                </button>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setInviteModalOpen(true)}>
                  <FiUserPlus size={16} /> Invite Member
                </button>
              </div>
            </motion.div>

            {/* Team Grid */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              <AnimatePresence>
                {teamMembers.map((member) => (
                  <motion.div 
                    layout
                    key={member.id} 
                    className="glass-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(91,140,255,0.4)' }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <button className="icon-btn" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setToastMsg(`More options for ${member.name}`)}>
                        <FiMoreHorizontal size={20} />
                      </button>

                      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '16px' }}>
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface-low)' }} 
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: '2px solid var(--surface-low)',
                          backgroundColor: member.status === 'online' ? 'var(--secondary)' : 
                                           member.status === 'away' ? 'var(--tertiary)' : 
                                           'var(--outline)'
                        }}></span>
                      </div>

                      <h4 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--on-surface)' }}>{member.name}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>{member.role}</span>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button className="btn-secondary" style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/chat')}>
                          <FiMessageCircle size={16} />
                        </button>
                        <button className="btn-secondary" style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setToastMsg(`Email client opened for ${member.name}`)}>
                          <FiMail size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Stats Footer */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderTop: '1px solid rgba(67, 70, 83, 0.3)', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.changeLabel}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {member.changeVal !== '-' && <FiTrendingUp size={14} color="var(--secondary)" />} {member.changeVal}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiActivity size={14} color="var(--primary)" /> {member.projects}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '16px', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(91, 140, 255, 0.2)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary)' }}>Invited members will receive an email to join your FlowSync workspace.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

      <Toast message={toastMsg} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Team;
