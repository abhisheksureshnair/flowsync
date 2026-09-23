import React, { useEffect, useState } from "react";
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
import { getDashboardData } from "../api/dashboard";
import { allTask } from "../api/taskApi";
import { Skeleton, SkeletonCircle, StatCardSkeleton } from "../components/ui/Skeleton";

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
  const [toastType, setToastType] = useState("success");
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.allSettled([
          (async () => {
            try {
              const res = await getDashboardData();
              if (isMounted) setDashboardData(res.data);
            } catch (err) {
              console.error("Failed to fetch dashboard data:", err);
            }
          })(),
          (async () => {
            try {
              const responce = await allTask();
              const raw = responce.data?.data || responce.data?.tasks || (Array.isArray(responce.data) ? responce.data : []);
              const sorted = [...raw].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              if (isMounted) setTasks(sorted);
            } catch (err) {
              console.error("Failed to fetch task data:", err);
            }
          })()
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => { isMounted = false; };
  }, []);

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
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Notifications</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)' }}>No new notifications.</p>
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
                <h2 className="welcome-headline" style={{ fontSize: '36px' }}>Welcome back, {user.name}.</h2>
                {isLoading ? (
                  <div style={{ marginTop: '10px' }}>
                    <Skeleton width="340px" height="18px" borderRadius="4px" />
                  </div>
                ) : (
                  <p className="welcome-desc" style={{ fontSize: '16px', opacity: 0.8, marginTop: '8px' }}>
                    {dashboardData
                      ? <>You have <span className="highlight-text font-bold" style={{ color: 'var(--primary)' }}>{dashboardData.totalTasks}</span> tasks across <span className="highlight-text font-bold" style={{ color: 'var(--primary)' }}>{dashboardData.activeProject}</span> active projects this week.</>
                      : "Welcome to your workspace."}
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="active-sprint-card glass-card" style={{ width: '320px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <SkeletonCircle size="56px" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Skeleton width="80px" height="12px" borderRadius="4px" />
                      <Skeleton width="160px" height="18px" borderRadius="6px" />
                      <Skeleton width="100px" height="12px" borderRadius="4px" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="active-sprint-card glass-card" style={{ width: '320px', padding: '20px', cursor: 'pointer' }} onClick={() => navigate("/tasks")}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '50%' }}>
                      <FiTrendingUp size={24} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, letterSpacing: '1px' }}>Active Sprint</span>
                      {dashboardData?.upcomingNextTask ? (
                        <>
                          <h4 style={{ fontSize: '16px', color: 'var(--on-surface)', margin: '4px 0' }}>{dashboardData.upcomingNextTask.title}</h4>
                          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                            {dashboardData.upcomingNextTask.dueDate
                              ? `Due ${new Date(dashboardData.upcomingNextTask.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}`
                              : dashboardData.upcomingNextTask.status || "In Progress"}
                          </span>
                        </>
                      ) : (
                        <>
                          <h4 style={{ fontSize: '16px', color: 'var(--on-surface)', margin: '4px 0' }}>No upcoming tasks</h4>
                          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>All caught up!</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Stats Grid */}
            <motion.section variants={itemVariants} className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '10px' }}>
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  {/* Tasks Completed */}
                  <div className="stat-card glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Tasks Completed</span>
                      <div style={{ padding: '8px', background: 'rgba(65, 238, 130, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
                        <FiCheckCircle size={20} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>
                      {dashboardData?.completedThisWeek ?? 0}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>This week</span>
                      <span style={{ color: 'var(--outline)' }}>out of {dashboardData?.totalTasks ?? 0} total</span>
                    </div>
                  </div>

                  {/* Active Projects */}
                  <div className="stat-card glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Active Projects</span>
                      <div style={{ padding: '8px', background: 'rgba(91, 140, 255, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                        <FiFolder size={20} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>
                      {dashboardData?.activeProject ?? 0}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>In Progress</span>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="stat-card glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Team Members</span>
                      <div style={{ padding: '8px', background: 'rgba(255, 184, 116, 0.1)', borderRadius: '8px', color: 'var(--tertiary)' }}>
                        <FiUsers size={20} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>
                      {dashboardData?.totalMembers ?? 0}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>Collaborators</span>
                    </div>
                  </div>

                  {/* Productivity */}
                  {(() => {
                    const completed = dashboardData?.completedThisWeek ?? 0;
                    const total = dashboardData?.totalTasks ?? 0;
                    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div className="stat-card glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <span style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>Productivity</span>
                          <div style={{ padding: '8px', background: 'rgba(65, 238, 130, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
                            <FiZap size={20} />
                          </div>
                        </div>
                        <h3 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>
                          {`${productivity}%`}
                        </h3>
                        <div className="productivity-progress" style={{ height: '6px', background: 'var(--surface-high)', borderRadius: '3px', overflow: 'hidden', marginTop: '12px' }}>
                          <div className="productivity-bar" style={{ width: `${productivity}%`, height: '100%', background: 'var(--secondary)', borderRadius: '3px', boxShadow: '0 0 10px rgba(65, 238, 130, 0.5)', transition: 'width 0.8s ease-out' }}></div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </motion.section>

            {/* Main Content Area */}
            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '20px' }}>

              {/* Recent Activity List */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Recent Activity</h3>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => navigate("/tasks")}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <SkeletonCircle size="40px" />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Skeleton width="60%" height="16px" borderRadius="4px" />
                            <Skeleton width="40%" height="12px" borderRadius="4px" />
                          </div>
                          <Skeleton width="50px" height="12px" borderRadius="4px" />
                        </div>
                      ))}
                    </div>
                  ) : tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--on-surface-variant)' }}>
                      <FiCheckCircle size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>No recent activity yet.</p>
                    </div>
                  ) : (
                    tasks.slice(0, 5).map((task) => {
                      const isCompleted = task.status === 'completed' || task.status === 'done';
                      const iconBg = isCompleted ? 'rgba(65, 238, 130, 0.1)' : 'rgba(91, 140, 255, 0.1)';
                      const iconColor = isCompleted ? 'var(--secondary)' : 'var(--primary)';
                      const timeAgo = (() => {
                        const diff = Date.now() - new Date(task.createdAt).getTime();
                        const mins = Math.floor(diff / 60000);
                        if (mins < 1) return 'just now';
                        if (mins < 60) return `${mins}m ago`;
                        const hrs = Math.floor(mins / 60);
                        if (hrs < 24) return `${hrs}h ago`;
                        return `${Math.floor(hrs / 24)}d ago`;
                      })();
                      return (
                        <div key={task._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiCheckCircle size={20} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{task.title}</span>
                              {task.status && <> &mdash; <span style={{ textTransform: 'capitalize' }}>{task.status}</span></>}
                            </p>
                            {(Array.isArray(task.assignedTo) ? task.assignedTo.length > 0 : task.assignedTo?.name) && (
                              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                                Assigned to <strong style={{ color: 'var(--on-surface)' }}>
                                  {Array.isArray(task.assignedTo)
                                    ? task.assignedTo.map(a => (typeof a === 'object' ? a.name || a.username : a)).filter(Boolean).join(", ")
                                    : (task.assignedTo.name || task.assignedTo.username || task.assignedTo)}
                                </strong>
                              </p>
                            )}
                            <span style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiClock size={12} /> {timeAgo}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Weekly Pulse */}
              {(() => {
                const completed = dashboardData?.completedThisWeek ?? 0;
                const total = dashboardData?.totalTasks ?? 0;
                const pulse = total > 0 ? Math.round((completed / total) * 100) : 0;
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (pulse / 100) * circumference;
                const remaining = total - completed;
                return (
                  <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(20, 26, 47, 0.9), rgba(91, 140, 255, 0.1))' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Weekly Pulse</h3>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '24px' }}>
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="var(--primary)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={isLoading ? circumference : offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                          <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--on-surface)' }}>{isLoading ? "—" : `${pulse}%`}</span>
                          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Done</span>
                        </div>
                      </div>
                      {isLoading ? (
                        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>Loading...</p>
                      ) : pulse === 100 ? (
                        <>
                          <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>All done! 🎉</h4>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>You've completed all {total} tasks this week. Great work!</p>
                        </>
                      ) : completed === 0 ? (
                        <>
                          <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Let's get started!</h4>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>You have {total} task{total !== 1 ? 's' : ''} to tackle this week.</p>
                        </>
                      ) : (
                        <>
                          <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Keep it up!</h4>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                            {remaining} task{remaining !== 1 ? 's' : ''} remaining to hit your weekly goal.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

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

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Dashboard;
