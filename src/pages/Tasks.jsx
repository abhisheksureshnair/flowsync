import React, { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiMoreHorizontal,
  FiFilter,
  FiPaperclip,
  FiUsers,
  FiSettings
} from "react-icons/fi";
import { allUser } from "../api/userApi";
import { addNewTask as addNewTaskApi, allTask, getUserAddedTask, getUserTask } from "../api/taskApi";
import noTasksImg from "../assets/no-tasks.png";


const UNASSIGNED_MEMBER = {
  id: "unassigned",
  name: "Unassigned",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
};

const PROJECTS = [
  "Nova Design System",
  "Sync Engine",
  "FlowSync App",
  "Marketing Dashboard"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "No date";
  if (dateStr === "Done" || dateStr === "Today") return dateStr;
  if (dateStr.match(/^[A-Za-z]{3}\s\d{1,2}$/)) return dateStr;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
};

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [userAddedTasks, setUserAddedTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All Tasks");
  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Create Task Form State
  const [newTask, setNewTask] = useState({
    title: "",
    desc: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    assignedTo: "",
    project: PROJECTS[0]
  });

  useEffect(() => {
    const fetchAllTasks = async (currentUsers) => {
      try {
        const response = await allTask();
        if (response && response.status === 200) {
          const dbTasks = response.data.data || [];
          const mappedTasks = dbTasks.map(dbTask => {
            const assignedUser = currentUsers.find(u => u._id === dbTask.assignedTo);
            return {
              id: dbTask._id,
              title: dbTask.title,
              desc: dbTask.description,
              priority: dbTask.priority,
              status: dbTask.status === "Todo" ? "To Do" : dbTask.status === "In Progress" ? "In Process" : dbTask.status,
              date: dbTask.dueDate || "Today",
              comments: 0,
              attachments: 0,
              project: dbTask.project,
              assignee: assignedUser ? {
                id: assignedUser._id,
                name: assignedUser.name || assignedUser.username,
                avatar: assignedUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
              } : UNASSIGNED_MEMBER
            };
          });
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error fetching all tasks:", error);
      }
    };

    const fetchUserTask = async (currentUsers) => {
      try {
        const response = await getUserTask();
        if (response && response.status === 200) {
          const dbTasks = response.data.data || [];
          const mappedTasks = dbTasks.map(dbTask => {
            const assignedUser = currentUsers.find(u => u._id === dbTask.assignedTo);
            return {
              id: dbTask._id,
              title: dbTask.title,
              desc: dbTask.description,
              priority: dbTask.priority,
              status: dbTask.status === "Todo" ? "To Do" : dbTask.status === "In Progress" ? "In Process" : dbTask.status,
              date: dbTask.dueDate || "Today",
              comments: 0,
              attachments: 0,
              project: dbTask.project,
              assignee: assignedUser ? {
                id: assignedUser._id,
                name: assignedUser.name || assignedUser.username,
                avatar: assignedUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
              } : UNASSIGNED_MEMBER
            };
          });
          setUserTasks(mappedTasks);
          setTasks(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newTasks = mappedTasks.filter(t => !existingIds.has(t.id));
            return [...newTasks, ...prev];
          });
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error);
      }
    };

    const fetchUseraddedTask = async (currentUsers) => {
      try {
        const useraddedTask = await getUserAddedTask();
        if (useraddedTask && useraddedTask.status === 200) {
          const dbTasks = useraddedTask.data.data || [];
          const mappedTasks = dbTasks.map(dbTask => {
            const assignedUser = currentUsers.find(u => u._id === dbTask.assignedTo);
            return {
              id: dbTask._id,
              title: dbTask.title,
              desc: dbTask.description,
              priority: dbTask.priority,
              status: dbTask.status === "Todo" ? "To Do" : dbTask.status === "In Progress" ? "In Process" : dbTask.status,
              date: dbTask.dueDate || "Today",
              comments: 0,
              attachments: 0,
              project: dbTask.project,
              assignee: assignedUser ? {
                id: assignedUser._id,
                name: assignedUser.name || assignedUser.username,
                avatar: assignedUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
              } : UNASSIGNED_MEMBER
            };
          });
          setUserAddedTasks(mappedTasks);
          setTasks(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newTasks = mappedTasks.filter(t => !existingIds.has(t.id));
            return [...newTasks, ...prev];
          });
        }
      } catch (error) {
        console.error("Error fetching user added tasks:", error);
        setToastMsg("Error fetching tasks from server");
        setToastType("error");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await allUser();
        if (response && response.status === 200) {
          const data = response.data.users;
          setUsers(data);
          if (data && data.length > 0) {
            setNewTask(prev => ({ ...prev, assignedTo: data[0]._id }));
          }
          return data;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setToastMsg("Error fetching users from server");
        setToastType("error");
      }
      return [];
    };

    const loadData = async () => {
      const loadedUsers = await fetchUsers();
      await fetchAllTasks(loadedUsers);
      await fetchUseraddedTask(loadedUsers);
      await fetchUserTask(loadedUsers);
    };

    loadData();
  }, []);

  const filteredTasks = activeTab === "All Tasks"
    ? tasks
    : activeTab === "Assigned By Me"
      ? userAddedTasks
      : activeTab === "Assigned For Me"
        ? userTasks
        : tasks.filter(t => t.status === activeTab);

  const markComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: "Completed", date: "Done" } : t));
    setUserAddedTasks(userAddedTasks.map(t => t.id === id ? { ...t, status: "Completed", date: "Done" } : t));
    setUserTasks(userTasks.map(t => t.id === id ? { ...t, status: "Completed", date: "Done" } : t));
    setSelectedTask(null);
    setToastMsg("Task marked as completed!");
    setToastType("success");
  };

  const addNewTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const payload = {
        title: newTask.title,
        description: newTask.desc,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        assignedTo: newTask.assignedTo,
        project: newTask.project
      };

      const response = await addNewTaskApi(payload);
      if (response && response.status === 200) {
        const dbTask = response.data.task;
        const assignedUser = users.find(u => u._id === dbTask.assignedTo);
        const taskObj = {
          id: dbTask._id,
          title: dbTask.title,
          desc: dbTask.description,
          priority: dbTask.priority,
          status: dbTask.status === "Todo" ? "To Do" : dbTask.status === "In Progress" ? "In Process" : dbTask.status,
          date: dbTask.dueDate || "Today",
          comments: 0,
          attachments: 0,
          project: dbTask.project,
          assignee: assignedUser ? {
            id: assignedUser._id,
            name: assignedUser.name || assignedUser.username,
            avatar: assignedUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
          } : UNASSIGNED_MEMBER
        };

        setTasks([taskObj, ...tasks]);
        setUserAddedTasks([taskObj, ...userAddedTasks]);
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && dbTask.assignedTo === currentUser._id) {
          setUserTasks([taskObj, ...userTasks]);
        }
        setCreateModalOpen(false);
        setNewTask({
          title: "",
          desc: "",
          priority: "Medium",
          status: "To Do",
          dueDate: "",
          assignedTo: users[0]?._id || "",
          project: PROJECTS[0]
        });
        setToastMsg("Task created successfully!");
        setToastType("success");
      } else {
        setToastMsg(response.data?.message || "Failed to create task");
        setToastType("error");
      }
    } catch (error) {
      if (error.response && error.response.status === 406) {
        setToastMsg("Date is assigned already");
        setToastType("error");
      } else {
        setToastMsg(error.response?.data?.message || error.message || "Failed to create task");
        setToastType("error");
      }
    }
  };


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
            <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
              <FiPlus size={16} style={{ marginRight: '6px' }} />
              Create Task
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
            style={{ maxWidth: '1200px', padding: '0 20px', gap: '30px' }}
          >
            {/* Header Block */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 8px 0' }}>Tasks</h2>
                <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', margin: 0 }}>Manage your team's workflow and performance in real-time.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => { setToastMsg("Filter menu opened"); setToastType("info"); }}>
                  <FiFilter size={16} /> Filter
                </button>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(67, 70, 83, 0.3)', paddingBottom: '16px' }}>
              {["All Tasks", "To Do", "In Process", "Completed", "Assigned By Me", "Assigned For Me"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab ? 'var(--surface-high)' : 'transparent',
                    color: activeTab === tab ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                    fontWeight: activeTab === tab ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </motion.div>

            {/* Tasks List */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    style={{
                      padding: '40px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '24px',
                      minHeight: '400px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <img 
                      src={noTasksImg} 
                      alt="No tasks found" 
                      style={{ 
                        width: '280px', 
                        height: '280px', 
                        borderRadius: '24px', 
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        objectFit: 'cover'
                      }} 
                    />
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>
                        No Tasks Found
                      </h3>
                      <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                        {activeTab === "Assigned By Me" 
                          ? "You haven't created any tasks yet." 
                          : activeTab === "Assigned For Me" 
                            ? "You don't have any tasks assigned to you right now." 
                            : `There are currently no tasks in "${activeTab}".`}
                      </p>
                    </div>
                    {activeTab !== "Completed" && (
                      <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
                        <FiPlus size={16} style={{ marginRight: '6px' }} />
                        Create New Task
                      </button>
                    )}
                  </motion.div>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card"
                      onClick={() => setSelectedTask(task)}
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderLeft: task.status === 'Completed' ? '4px solid var(--secondary)' :
                          task.status === 'In Process' ? '4px solid var(--primary)' :
                            '4px solid transparent'
                      }}
                      whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: 1 }}>
                        <div style={{ marginTop: '4px', color: task.status === 'Completed' ? 'var(--secondary)' : 'var(--outline)' }}>
                          <FiCheckCircle size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>{task.title}</h4>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 600,
                              background: task.priority === 'High' ? 'rgba(255, 180, 171, 0.15)' :
                                task.priority === 'Medium' ? 'rgba(255, 184, 116, 0.15)' :
                                  'rgba(141, 144, 159, 0.15)',
                              color: task.priority === 'High' ? 'var(--error)' :
                                task.priority === 'Medium' ? 'var(--tertiary)' :
                                  'var(--on-surface-variant)'
                            }}>
                              {task.priority}
                            </span>
                            {task.project && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                background: 'rgba(91, 140, 255, 0.15)',
                                color: 'var(--primary)'
                              }}>
                                {task.project}
                              </span>
                            )}
                            {(activeTab === "All Tasks" || activeTab === "Assigned By Me" || activeTab === "Assigned For Me") && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                background: task.status === 'Completed' ? 'rgba(65, 238, 130, 0.15)' :
                                  task.status === 'In Process' ? 'rgba(91, 140, 255, 0.15)' :
                                    'rgba(255, 255, 255, 0.1)',
                                color: task.status === 'Completed' ? 'var(--secondary)' :
                                  task.status === 'In Process' ? 'var(--primary)' :
                                    'var(--on-surface-variant)'
                              }}>
                                {task.status}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.5, maxWidth: '800px' }}>{task.desc}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--outline)' }}>
                          {task.comments > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                              <FiMessageSquare size={16} /> {task.comments}
                            </div>
                          )}
                          {task.attachments > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                              <FiPaperclip size={16} /> {task.attachments}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                          <FiClock size={16} /> {formatDate(task.date)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={task.assignee?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"} alt={task.assignee?.name || "Assignee"} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          {(activeTab === "Assigned By Me" || activeTab === "Assigned For Me") && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Assigned to</span>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)' }}>{task.assignee?.name || "Unassigned"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Task">
        <form onSubmit={addNewTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Task Title</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Description</label>
            <textarea
              rows={3}
              value={newTask.desc}
              onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
              className="form-input custom-scrollbar"
              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              >
                <option>To Do</option>
                <option>In Process</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Project</label>
              <select
                value={newTask.project}
                onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              >
                {PROJECTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Assigned To</label>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
            >
              <option value="">Select Assignee</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* Task Details Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
        {selectedTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 600,
                background: selectedTask.priority === 'High' ? 'rgba(255, 180, 171, 0.15)' : 'rgba(255, 184, 116, 0.15)',
                color: selectedTask.priority === 'High' ? 'var(--error)' : 'var(--tertiary)'
              }}>
                {selectedTask.priority} Priority
              </span>
              <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{selectedTask.status}</span>
            </div>

            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{selectedTask.title}</h3>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{selectedTask.desc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: 'var(--surface-high)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedTask.assignee?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"}
                  alt={selectedTask.assignee?.name || "Assignee"}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assignee</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{selectedTask.assignee?.name || "Unassigned"}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--primary)' }}>{selectedTask.project || "N/A"}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: selectedTask.date === 'Done' ? 'var(--secondary)' : 'var(--on-surface)' }}>{formatDate(selectedTask.date)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="btn-secondary" onClick={() => setSelectedTask(null)}>Close</button>
              {selectedTask.status !== 'Completed' && (
                <button className="btn-primary" onClick={() => markComplete(selectedTask.id)}>Mark as Complete</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Actions Modal */}
      <Modal isOpen={isQuickActionsOpen} onClose={() => setQuickActionsOpen(false)} title="Quick Actions">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button
            onClick={() => { setQuickActionsOpen(false); setCreateModalOpen(true); }}
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

      {/* Global Toast */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default Tasks;
