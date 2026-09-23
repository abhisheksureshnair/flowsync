import React, { useEffect, useState, useRef } from "react";
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
  FiPaperclip,
  FiUsers,
  FiSettings,
  FiCheck,
  FiX
} from "react-icons/fi";
import { allUser } from "../api/userApi";
import { addNewTask as addNewTaskApi, allTask, getUserAddedTask, getUserTask } from "../api/taskApi";
import noTasksImg from "../assets/no-tasks.png";
import { TaskCardSkeleton } from "../components/ui/Skeleton";


const UNASSIGNED_MEMBER = {
  id: "unassigned",
  name: "Unassigned",
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Unassigned`
};

const PROJECTS = [];

const TABS = [
  { id: "All Tasks", label: "All Tasks" },
  { id: "ToDo", label: "ToDo" },
  { id: "In Process", label: "In Process" },
  { id: "Completed", label: "Completed" },
  { id: "Assigned By Me", label: "Assigned By Me" },
  { id: "Assigned For Me", label: "Assigned For Me" }
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef(null);

  // Close assignee dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target)) {
        setIsAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to extract multiple assignees
  const getAssignees = (dbAssignedTo, currentUsers = []) => {
    if (!dbAssignedTo) return [];
    const items = Array.isArray(dbAssignedTo) ? dbAssignedTo : [dbAssignedTo];
    return items
      .map(item => {
        if (!item) return null;
        if (typeof item === 'object' && (item._id || item.id)) {
          const id = item._id || item.id;
          return {
            id,
            name: item.name || item.username || "User",
            avatar: item.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || item.username || "User")}`
          };
        }
        const found = currentUsers.find(u => u._id === item);
        if (found) {
          return {
            id: found._id,
            name: found.name || found.username || "User",
            avatar: found.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(found.name || found.username || "User")}`
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const mapDbTask = (dbTask, currentUsers = []) => {
    const assignees = getAssignees(dbTask.assignedTo, currentUsers);
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
      assignees: assignees,
      assignee: assignees[0] || UNASSIGNED_MEMBER,
      rawAssignedTo: dbTask.assignedTo,
    };
  };

  const isAssignedToUser = (dbAssignedTo, userId) => {
    if (!dbAssignedTo || !userId) return false;
    if (Array.isArray(dbAssignedTo)) {
      return dbAssignedTo.some(a => (typeof a === 'object' ? (a._id || a.id) === userId : a === userId));
    }
    return typeof dbAssignedTo === 'object' ? (dbAssignedTo._id || dbAssignedTo.id) === userId : dbAssignedTo === userId;
  };

  // Create Task Form State (assignedTo is array of user IDs)
  const [newTask, setNewTask] = useState({
    title: "",
    desc: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    assignedTo: [],
    project: ""
  });

  const handleToggleAssignee = (userId) => {
    setNewTask(prev => {
      const current = Array.isArray(prev.assignedTo) ? prev.assignedTo : (prev.assignedTo ? [prev.assignedTo] : []);
      const exists = current.includes(userId);
      const updated = exists ? current.filter(id => id !== userId) : [...current, userId];
      return { ...prev, assignedTo: updated };
    });
  };

  const handleSelectAllAssignees = () => {
    setNewTask(prev => ({
      ...prev,
      assignedTo: users.map(u => u._id)
    }));
  };

  const handleClearAssignees = () => {
    setNewTask(prev => ({
      ...prev,
      assignedTo: []
    }));
  };

  useEffect(() => {
    const fetchAllTasks = async (currentUsers) => {
      try {
        const response = await allTask();
        if (response && response.status === 200) {
          const dbTasks = response.data.data || [];
          const mappedTasks = dbTasks.map(dbTask => mapDbTask(dbTask, currentUsers));
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
          const mappedTasks = dbTasks.map(dbTask => mapDbTask(dbTask, currentUsers));
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
          const mappedTasks = dbTasks.map(dbTask => mapDbTask(dbTask, currentUsers));
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
            setNewTask(prev => ({
              ...prev,
              assignedTo: prev.assignedTo && prev.assignedTo.length > 0 ? prev.assignedTo : [data[0]._id]
            }));
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
      setIsLoading(true);
      try {
        const loadedUsers = await fetchUsers();
        await Promise.allSettled([
          fetchAllTasks(loadedUsers),
          fetchUseraddedTask(loadedUsers),
          fetchUserTask(loadedUsers)
        ]);
      } catch (err) {
        console.error("Error loading task data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getTabCount = (tabId) => {
    switch (tabId) {
      case "All Tasks":
        return tasks.length;
      case "ToDo":
      case "To Do":
        return tasks.filter(t => t.status === "To Do" || t.status === "ToDo" || t.status === "Todo").length;
      case "In Process":
        return tasks.filter(t => t.status === "In Process" || t.status === "In Progress").length;
      case "Completed":
        return tasks.filter(t => t.status === "Completed" || t.status === "done").length;
      case "Assigned By Me":
        return userAddedTasks.length;
      case "Assigned For Me":
        return userTasks.length;
      default:
        return 0;
    }
  };

  const filteredTasks = activeTab === "All Tasks"
    ? tasks
    : activeTab === "Assigned By Me"
      ? userAddedTasks
      : activeTab === "Assigned For Me"
        ? userTasks
        : tasks.filter(t => (activeTab === "ToDo" || activeTab === "To Do")
            ? (t.status === "To Do" || t.status === "ToDo" || t.status === "Todo")
            : t.status === activeTab
          );

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

    if (!newTask.assignedTo || newTask.assignedTo.length === 0) {
      setToastMsg("Please select at least one assignee.");
      setToastType("warning");
      return;
    }

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
        const taskObj = mapDbTask(dbTask, users);

        setTasks([taskObj, ...tasks]);
        setUserAddedTasks([taskObj, ...userAddedTasks]);
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && isAssignedToUser(dbTask.assignedTo, currentUser._id)) {
          setUserTasks([taskObj, ...userTasks]);
        }
        setCreateModalOpen(false);
        setIsAssigneeDropdownOpen(false);
        setNewTask({
          title: "",
          desc: "",
          priority: "Medium",
          status: "To Do",
          dueDate: "",
          assignedTo: users[0]?._id ? [users[0]._id] : [],
          project: ""
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
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 8px 0' }}>Tasks</h2>
                <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', margin: 0 }}>Manage your team's workflow and performance in real-time.</p>
              </div>
            </motion.div>

            {/* Apple-Style Segmented Navigation Bar */}
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', width: '100%', overflowX: 'auto', paddingBottom: '4px' }} className="custom-scrollbar">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  position: 'relative'
                }}
              >
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id || (tab.id === "ToDo" && activeTab === "To Do") || (tab.id === "To Do" && activeTab === "ToDo");
                  const count = getTabCount(tab.id);
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'transparent',
                        color: isActive ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                        transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        outline: 'none'
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="appleActivePill"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32
                          }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'var(--surface-high)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '9999px',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(12px)',
                            zIndex: -1
                          }}
                        />
                      )}
                      <span>{tab.label}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                          color: isActive ? '#ffffff' : 'var(--outline)',
                          boxShadow: isActive ? '0 0 10px rgba(91, 140, 255, 0.4)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tasks List */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    key="tasks-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <TaskCardSkeleton key={idx} />
                    ))}
                  </motion.div>
                ) : filteredTasks.length === 0 ? (
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
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {(task.assignees && task.assignees.length > 0 ? task.assignees : [task.assignee || UNASSIGNED_MEMBER])
                              .slice(0, 3)
                              .map((a, idx) => (
                                <img
                                  key={a?.id || idx}
                                  src={a?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a?.name || "Unassigned")}`}
                                  alt={a?.name || "Assignee"}
                                  title={a?.name}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid var(--surface-card, #1e293b)',
                                    marginLeft: idx > 0 ? '-10px' : '0',
                                    zIndex: 3 - idx
                                  }}
                                />
                              ))}
                            {task.assignees && task.assignees.length > 3 && (
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  background: 'var(--surface-high)',
                                  color: 'var(--on-surface-variant)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px solid var(--surface-card, #1e293b)',
                                  marginLeft: '-10px',
                                  zIndex: 0
                                }}
                              >
                                +{task.assignees.length - 3}
                              </div>
                            )}
                          </div>
                          {(activeTab === "Assigned By Me" || activeTab === "Assigned For Me") && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Assigned to</span>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)' }}>
                                {task.assignees && task.assignees.length > 0
                                  ? task.assignees.map(a => a.name).join(", ")
                                  : (task.assignee?.name || "Unassigned")}
                              </span>
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
              <input
                type="text"
                value={newTask.project}
                onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                placeholder="e.g. My Project"
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={assigneeDropdownRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                Assigned To {newTask.assignedTo?.length > 0 && `(${newTask.assignedTo.length} selected)`}
              </label>
              {users.length > 1 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllAssignees}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--outline-variant)', fontSize: '11px' }}>|</span>
                  <button
                    type="button"
                    onClick={handleClearAssignees}
                    style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Selected Assignees Chips */}
            {newTask.assignedTo?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '2px' }}>
                {newTask.assignedTo.map(userId => {
                  const userObj = users.find(u => u._id === userId);
                  const name = userObj ? (userObj.name || userObj.username) : "User";
                  const avatar = userObj?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                  return (
                    <div
                      key={userId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px 4px 6px',
                        background: 'rgba(91, 140, 255, 0.15)',
                        border: '1px solid rgba(91, 140, 255, 0.3)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--on-surface)'
                      }}
                    >
                      <img src={avatar} alt={name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAssignee(userId);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--on-surface-variant)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 2px',
                          fontSize: '12px',
                          lineHeight: 1
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Assignee Selector Trigger */}
            <div
              onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: 'var(--surface-high)',
                border: isAssigneeDropdownOpen ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
                borderRadius: '8px',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                boxShadow: isAssigneeDropdownOpen ? '0 0 0 2px rgba(91, 140, 255, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: newTask.assignedTo?.length ? 'var(--on-surface)' : 'var(--on-surface-variant)', fontSize: '13.5px' }}>
                <FiUsers size={16} style={{ color: 'var(--primary)' }} />
                <span>
                  {newTask.assignedTo?.length === 0
                    ? "Select assignees (click to choose)"
                    : `${newTask.assignedTo.length} person${newTask.assignedTo.length > 1 ? 's' : ''} assigned`}
                </span>
              </div>
              <span style={{ transform: isAssigneeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: 'var(--on-surface-variant)', fontSize: '11px' }}>
                ▼
              </span>
            </div>

            {/* Assignee Multi-select Popover Dropdown */}
            {isAssigneeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--surface-card, #1e293b)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  zIndex: 100,
                  padding: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}
              >
                {users.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                    No team members found
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {users.map(u => {
                      const isSelected = (newTask.assignedTo || []).includes(u._id);
                      const name = u.name || u.username;
                      const avatar = u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                      return (
                        <div
                          key={u._id}
                          onClick={() => handleToggleAssignee(u._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: isSelected ? 'rgba(91, 140, 255, 0.16)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={avatar} alt={name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--primary)' : 'var(--on-surface)' }}>
                                {name}
                              </span>
                              {u.username && u.name && (
                                <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>@{u.username}</span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isSelected ? 'none' : '1.5px solid var(--outline-variant)',
                              background: isSelected ? 'var(--primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          >
                            {isSelected && <FiCheck size={12} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(selectedTask.assignees && selectedTask.assignees.length > 0 ? selectedTask.assignees : [selectedTask.assignee || UNASSIGNED_MEMBER])
                    .slice(0, 3)
                    .map((a, idx) => (
                      <img
                        key={a?.id || idx}
                        src={a?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a?.name || "Unassigned")}`}
                        alt={a?.name || "Assignee"}
                        title={a?.name}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--surface-card, #1e293b)',
                          marginLeft: idx > 0 ? '-10px' : '0',
                          zIndex: 3 - idx
                        }}
                      />
                    ))}
                  {selectedTask.assignees && selectedTask.assignees.length > 3 && (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--surface-high)',
                        color: 'var(--on-surface-variant)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--surface-card, #1e293b)',
                        marginLeft: '-10px',
                        zIndex: 0
                      }}
                    >
                      +{selectedTask.assignees.length - 3}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Assignee{selectedTask.assignees?.length > 1 ? `s (${selectedTask.assignees.length})` : ''}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {selectedTask.assignees && selectedTask.assignees.length > 0
                      ? selectedTask.assignees.map(a => a.name).join(", ")
                      : (selectedTask.assignee?.name || "Unassigned")}
                  </div>
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
