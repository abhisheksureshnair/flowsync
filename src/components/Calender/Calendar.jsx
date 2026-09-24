import React, { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "../layout/Sidebar";
import Modal from "../ui/Modal";
import Toast from "../ui/Toast";
import "../../styles/global.css";
import "../../styles/calendar.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FiSearch, 
  FiBell, 
  FiPlus, 
  FiCheckCircle, 
  FiChevronLeft, 
  FiChevronRight, 
  FiClock, 
  FiTrash2, 
  FiCalendar, 
  FiMapPin, 
  FiUser,
  FiUsers
} from "react-icons/fi";
import { allUser } from "../../api/userApi";
import { getUserTask, addNewTask } from "../../api/taskApi";
import { CalendarAgendaSkeleton, Skeleton } from "../ui/Skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Calendar() {
  const navigate = useNavigate();

  // Date States
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeView, setActiveView] = useState("Month"); // Month, Week, Day, Agenda
  const [hoveredCell, setHoveredCell] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Notification and Toast States
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef(null);

  // New Event / Task Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Meeting",
    date: "",
    time: "10:00",
    status: "To Do",
    priority: "Medium",
    project: "",
    location: "",
    attendees: [],
    assignedTo: []
  });

  const [attendeesList, setAttendeesList] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Close assignee dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setIsAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAssignee = (userId) => {
    setNewEvent(prev => {
      const current = prev.assignedTo || [];
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      return { ...prev, assignedTo: updated };
    });
  };

  const handleSelectAllAssignees = () => {
    setNewEvent(prev => ({
      ...prev,
      assignedTo: rawUsers.map(u => u._id)
    }));
  };

  const handleClearAssignees = () => {
    setNewEvent(prev => ({
      ...prev,
      assignedTo: []
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const loadCalendarData = async () => {
      setIsLoadingTasks(true);
      try {
        await Promise.allSettled([
          (async () => {
            try {
              const res = await allUser();
              if (res && res.status === 200 && res.data?.users && isMounted) {
                setRawUsers(res.data.users);
                const mapped = res.data.users.map(u => ({
                  id: u._id || u.id,
                  name: u.name || u.username || "Member",
                  avatar: u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.username || "User")}`
                }));
                setAttendeesList(mapped);
              }
            } catch (err) {
              console.error("Failed to load attendees:", err);
            }
          })(),
          (async () => {
            try {
              const res = await getUserTask();
              const raw = res?.data?.data || res?.data?.tasks || (Array.isArray(res?.data) ? res.data : []);
              if (isMounted) setUserTasks(Array.isArray(raw) ? raw : []);
            } catch (err) {
              console.error("Failed to load user tasks for calendar:", err);
            }
          })()
        ]);
      } finally {
        if (isMounted) setIsLoadingTasks(false);
      }
    };

    loadCalendarData();
    return () => { isMounted = false; };
  }, []);

  // Events list initialized from persistence (no hardcoded demo events)
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("flowsync_calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("flowsync_calendar_events", JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  }, [events]);

  // Dismiss hover tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (hoveredCell) setHoveredCell(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [hoveredCell]);

  // Compute smart tooltip coordinates anchored to hovered cell
  const tooltipStyle = useMemo(() => {
    if (!hoveredCell?.rect) return null;
    const { top, bottom, left, width } = hoveredCell.rect;
    const centerX = left + width / 2;
    const clampedX = Math.max(160, Math.min(window.innerWidth - 160, centerX));
    const showAbove = top > 240;

    return {
      position: "fixed",
      left: `${clampedX}px`,
      top: showAbove ? `${top - 10}px` : `${bottom + 10}px`,
      transform: showAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      zIndex: 9999,
      pointerEvents: "none",
    };
  }, [hoveredCell]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate days for standard 42-cell Month View Grid
  const daysInGrid = useMemo(() => {
    const tempDays = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      tempDays.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      tempDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Trailing days of next month
    const remaining = 42 - tempDays.length;
    for (let i = 1; i <= remaining; i++) {
      tempDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return tempDays;
  }, [year, month]);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Check if a date object represents today
  const isDateToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if a date object is the currently selected date
  const isDateSelected = (date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Format date to ISO date string (YYYY-MM-DD)
  const getISODateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Helper to parse dueDate or createdAt from API into YYYY-MM-DD
  const getTaskISODate = (dueDate, createdAt) => {
    if (dueDate) {
      if (typeof dueDate === "string" && dueDate.includes("T")) {
        return dueDate.split("T")[0];
      }
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        return getISODateString(d);
      }
    }
    if (createdAt) {
      if (typeof createdAt === "string" && createdAt.includes("T")) {
        return createdAt.split("T")[0];
      }
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return getISODateString(d);
      }
    }
    return getISODateString(new Date());
  };

  // Combine manual calendar events and tasks from /task/getusertask
  const allEvents = useMemo(() => {
    const now = Date.now();

    const mappedTasks = userTasks.map(task => {
      const taskDate = getTaskISODate(task.dueDate, task.createdAt);
      const assignedName = Array.isArray(task.assignedTo)
        ? task.assignedTo.map(a => (typeof a === "object" ? a.name || a.username : a)).filter(Boolean).join(", ")
        : task.assignedTo && typeof task.assignedTo === "object"
        ? task.assignedTo.name
        : (typeof task.assignedTo === "string" ? task.assignedTo : "");

      // Check if due date is less than 48 hours away
      let isDeadline = false;
      if (task.dueDate && task.status !== "Completed") {
        const dueTime = new Date(task.dueDate).getTime();
        if (!isNaN(dueTime)) {
          const diffHours = (dueTime - now) / (1000 * 60 * 60);
          if (diffHours <= 48) {
            isDeadline = true;
          }
        }
      }

      const projectName = isDeadline
        ? (task.project ? `${task.project} (Deadline Project)` : "Deadline Project")
        : (task.project || "General");

      return {
        id: task._id || `task-${task.id || Math.random()}`,
        title: task.title,
        description: isDeadline
          ? `⚠️ Deadline Project (<48h remaining) • ${task.description || ""} • Status: ${task.status || "Todo"}`.trim()
          : (task.description || `${task.project ? `[${task.project}] ` : ""}${task.priority || "Medium"} Priority • Status: ${task.status || "Todo"}`),
        type: isDeadline ? "Deadline" : "Task",
        date: taskDate,
        time: task.dueDate ? (isDeadline ? "Due <48h" : "Due Date") : "All Day",
        location: isDeadline ? `Deadline Project: ${task.project || "Urgent"}` : (task.project ? `Project: ${task.project}` : "Tasks Board"),
        isTask: true,
        isDeadline: isDeadline,
        status: task.status || "Todo",
        priority: isDeadline ? (task.priority || "High") : (task.priority || "Medium"),
        project: projectName,
        attendees: assignedName ? [
          {
            name: assignedName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignedName)}`
          }
        ] : []
      };
    });

    return [...events, ...mappedTasks];
  }, [events, userTasks]);

  // Filter events based on active category, search query, and active view/selected date
  const filteredEvents = useMemo(() => {
    return allEvents.filter(evt => {
      // 1. Search Query
      const matchesSearch = 
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category
      const matchesCategory = activeCategory === "All" || evt.type === activeCategory;

      if (!matchesSearch || !matchesCategory) return false;

      // 3. View context
      if (activeView === "Month" || activeView === "Week" || activeView === "Day") {
        // If we are looking at Month/Week/Day, we only filter the sidebar agenda list by the selected date.
        // But for Agenda tab view, we show ALL search-matching events in one big list!
        const selectedISO = getISODateString(selectedDate);
        
        if (activeView === "Day") {
          return evt.date === selectedISO;
        } else if (activeView === "Week") {
          // Check if event date falls within the 7-day range of selectedDate's week
          const startOfWeek = new Date(selectedDate);
          startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const evtDate = new Date(evt.date + "T00:00:00");
          return evtDate >= new Date(startOfWeek.setHours(0,0,0,0)) && 
                 evtDate <= new Date(endOfWeek.setHours(23,59,59,999));
        } else {
          // Month view sidebar shows events for the clicked/selected date
          return evt.date === selectedISO;
        }
      }
      
      // For Agenda view, show all upcoming events matching search/category filters
      return true;
    });
  }, [allEvents, selectedDate, activeView, searchQuery, activeCategory]);

  // Get event indicators for a specific grid cell
  const getCellEvents = (cellDate) => {
    const isoString = getISODateString(cellDate);
    return allEvents.filter(evt => evt.date === isoString);
  };

  // Handle Event / Task Creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) {
      setToastMsg(`Please fill out ${newEvent.type === "Task" ? "Task Title and Due Date" : "Title and Date"} fields.`);
      setToastType("error");
      return;
    }

    if (newEvent.type === "Task") {
      if (!newEvent.assignedTo || newEvent.assignedTo.length === 0) {
        setToastMsg("Please select at least one team member to assign.");
        setToastType("warning");
        return;
      }

      try {
        const payload = {
          title: newEvent.title.trim(),
          description: newEvent.description || "",
          status: newEvent.status || "To Do",
          priority: newEvent.priority || "Medium",
          dueDate: newEvent.date,
          assignedTo: newEvent.assignedTo,
          project: newEvent.project || "General"
        };

        const res = await addNewTask(payload);
        if (res && res.status === 200) {
          const createdTask = res.data.task || res.data.data;
          if (createdTask) {
            setUserTasks(prev => [createdTask, ...prev]);
          }
          setToastMsg(`Successfully created task: "${newEvent.title}"`);
          setToastType("success");
        } else {
          setToastMsg("Task created successfully.");
          setToastType("success");
        }
      } catch (err) {
        console.error("Failed to create task:", err);
        setToastMsg(err.response?.data?.message || "Failed to create task");
        setToastType("error");
        return;
      }
    } else {
      const newEventObj = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        description: newEvent.description || "No description provided.",
        type: newEvent.type,
        date: newEvent.date,
        time: newEvent.time ? formatTime(newEvent.time) : "All Day",
        location: newEvent.location || "Online",
        attendees: newEvent.attendees.map(name => attendeesList.find(a => a.name === name)).filter(Boolean)
      };

      setEvents(prev => [...prev, newEventObj]);
      setToastMsg(`Successfully scheduled event: "${newEvent.title}"`);
      setToastType("success");
    }

    setCreateModalOpen(false);
    setIsAssigneeDropdownOpen(false);
    
    // Set selected date to the date of the newly created event to view it
    const parts = newEvent.date.split("-");
    setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    
    setNewEvent({
      title: "",
      description: "",
      type: "Meeting",
      date: "",
      time: "10:00",
      status: "To Do",
      priority: "Medium",
      project: "",
      location: "",
      attendees: [],
      assignedTo: []
    });
  };

  // Format 24h input string (HH:MM) to standard AM/PM
  const formatTime = (timeStr) => {
    const [hStr, mStr] = timeStr.split(":");
    let h = parseInt(hStr);
    const m = mStr;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // 0 should be 12
    return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
  };

  // Delete Event
  const handleDeleteEvent = (id, title) => {
    const isApiTask = allEvents.find(evt => evt.id === id)?.isTask;
    if (isApiTask) {
      setToastMsg(`"${title}" is synced from your tasks. Manage it on the Tasks board.`);
      setToastType("info");
      return;
    }
    setEvents(prev => prev.filter(evt => evt.id !== id));
    setToastMsg(`Deleted event: "${title}"`);
    setToastType("info");
  };

  // Months labels
  const monthLabels = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const getCurrentUserAttendeeName = () => {
    const currentUserId = currentUser.id || currentUser._id;
    const currentUserName = currentUser.name || currentUser.username || "You";
    const found = attendeesList.find(a => 
      (currentUserId && (a.id === currentUserId || a._id === currentUserId)) ||
      a.name?.toLowerCase() === currentUserName?.toLowerCase()
    );
    return found ? found.name : currentUserName;
  };

  // Toggle attendees selections in modal form
  const handleAttendeeToggle = (name) => {
    setNewEvent(prev => {
      const current = prev.attendees || [];
      const alreadyAdded = current.includes(name);
      return {
        ...prev,
        attendees: alreadyAdded 
          ? current.filter(n => n !== name)
          : [...current, name]
      };
    });
  };

  const handleAttendeeRemove = (name) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: (prev.attendees || []).filter(n => n !== name)
    }));
  };

  const handleAttendeeClear = () => {
    setNewEvent(prev => ({
      ...prev,
      attendees: []
    }));
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        {/* Header matching dashboard */}
        <header className="top-header">
          <div className="header-search">
            <FiCalendar size={18} color="var(--on-surface-variant)" />
            <span style={{ fontSize: "15px", color: "var(--on-surface-variant)", paddingLeft: "8px" }}>
              Calendar &amp; Schedule
            </span>
          </div>
          
          <div className="header-actions" style={{ position: "relative" }}>
            <button 
              className="btn-primary" 
              onClick={() => {
                // Pre-populate new event's date with the selected date
                setNewEvent(prev => ({ 
                  ...prev, 
                  date: getISODateString(selectedDate),
                  attendees: prev.type === "Personal" ? [getCurrentUserAttendeeName()] : prev.attendees
                }));
                setCreateModalOpen(true);
              }}
            >
              <FiPlus size={16} style={{ marginRight: "6px" }} />
              Create Event
            </button>
            <div className="header-divider" style={{ width: "1px", height: "24px", background: "var(--outline-variant)" }}></div>
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
                  style={{ position: "absolute", top: "100%", right: 0, marginTop: "12px", width: "320px", padding: "16px", zIndex: 100 }}
                >
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>Recent Alerts</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ padding: "6px", background: "rgba(91,140,255,0.1)", color: "var(--primary)", borderRadius: "50%" }}>
                        <FiCheckCircle size={14} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--on-surface)" }}>Sync Complete: 6 calendar items.</p>
                        <span style={{ fontSize: "11px", color: "var(--outline)" }}>Just now</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Scroll Area */}
        <div className="calendar-container custom-scrollbar">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="calendar-grid-layout"
          >
            {/* Left Block: Main Calendar */}
            <motion.div variants={itemVariants} className="glass-card calendar-card">
              {/* Calendar Nav Header */}
              <div className="calendar-nav-header">
                <div>
                  <span className="calendar-month-year">
                    {monthLabels[month]} {year}
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button 
                      onClick={handleGoToday}
                      className="filter-btn" 
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      Today
                    </button>
                    <span style={{ fontSize: "13px", color: "var(--outline)", alignSelf: "center" }}>
                      Active: {selectedDate.toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>

                <div className="calendar-nav-buttons" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  {/* Event Filter */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--surface-high)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    gap: "6px"
                  }}>
                    <FiSearch size={13} color="var(--on-surface-variant)" />
                    <input
                      type="text"
                      placeholder="Filter events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--on-surface)",
                        fontSize: "12px",
                        outline: "none",
                        width: "120px"
                      }}
                    />
                  </div>

                  {/* View Toggles */}
                  <div className="view-toggle-group">
                    {["Month", "Week", "Day", "Agenda"].map(view => (
                      <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`view-toggle-btn ${activeView === view ? "active" : ""}`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>

                  {/* Prev / Next Month Arrow Buttons */}
                  <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
                    <button onClick={handlePrevMonth} className="filter-btn" style={{ padding: "8px" }}>
                      <FiChevronLeft size={16} />
                    </button>
                    <button onClick={handleNextMonth} className="filter-btn" style={{ padding: "8px" }}>
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* View Rendering Logic */}
              {activeView === "Month" && (
                <div className="calendar-month-grid">
                  {/* Weekday Titles */}
                  {weekdays.map((day, idx) => (
                    <div key={`wday-${idx}`} className="calendar-weekday-label">
                      {day}
                    </div>
                  ))}

                  {/* Grid Days */}
                  {daysInGrid.map((cell, idx) => {
                    const cellEvents = getCellEvents(cell.date);
                    const isTodayCell = isDateToday(cell.date);
                    const isSelectedCell = isDateSelected(cell.date);

                    return (
                      <button
                        key={`cell-${idx}`}
                        onClick={() => setSelectedDate(cell.date)}
                        onMouseEnter={(e) => {
                          if (cellEvents.length > 0) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              date: cell.date,
                              events: cellEvents,
                              rect: {
                                top: rect.top,
                                bottom: rect.bottom,
                                left: rect.left,
                                right: rect.right,
                                width: rect.width,
                                height: rect.height,
                              }
                            });
                          } else {
                            setHoveredCell(null);
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`day-cell 
                          ${!cell.isCurrentMonth ? "inactive-month" : ""} 
                          ${isTodayCell ? "today-cell" : ""} 
                          ${isSelectedCell ? "selected-cell" : ""}
                        `}
                      >
                        <span className="day-number">{cell.date.getDate()}</span>
                        
                        {/* Event Dot indicators */}
                        {cellEvents.length > 0 && (
                          <div className="day-events-dots">
                            {cellEvents.slice(0, 4).map((evt, eIdx) => (
                              <span 
                                key={`dot-${evt.id}-${eIdx}`} 
                                className={`event-dot-indicator event-dot-${evt.type.toLowerCase()}`}
                                title={evt.title}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeView === "Week" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "16px", color: "var(--on-surface-variant)" }}>Weekly Overview</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
                    {(() => {
                      // Generate 7 days of the selected week
                      const startOfWeek = new Date(selectedDate);
                      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                      
                      return Array.from({ length: 7 }).map((_, i) => {
                        const dayObj = new Date(startOfWeek);
                        dayObj.setDate(startOfWeek.getDate() + i);
                        const isSel = isDateSelected(dayObj);
                        const isTod = isDateToday(dayObj);
                        const evts = getCellEvents(dayObj);

                        return (
                          <div 
                            key={`w-${i}`} 
                            onClick={() => setSelectedDate(dayObj)}
                            onMouseEnter={(e) => {
                              if (evts.length > 0) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredCell({
                                  date: dayObj,
                                  events: evts,
                                  rect: {
                                    top: rect.top,
                                    bottom: rect.bottom,
                                    left: rect.left,
                                    right: rect.right,
                                    width: rect.width,
                                    height: rect.height,
                                  }
                                });
                              } else {
                                setHoveredCell(null);
                              }
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              padding: "16px",
                              borderRadius: "12px",
                              background: isSel ? "rgba(91, 140, 255, 0.1)" : "rgba(255,255,255,0.02)",
                              border: isSel ? "1.5px solid var(--primary)" : isTod ? "1.5px solid rgba(91, 140, 255, 0.5)" : "1px solid rgba(255,255,255,0.05)",
                              textAlign: "center",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--outline)", textTransform: "uppercase" }}>{weekdays[i]}</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px 0", color: isTod ? "var(--primary)" : "var(--on-surface)" }}>{dayObj.getDate()}</div>
                            <div style={{ fontSize: "11px", color: "var(--outline)" }}>{evts.length} {evts.length === 1 ? "event" : "events"}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Detailed list for the selected week */}
                  <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.15)", borderRadius: "12px", padding: "16px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--on-surface)" }}>Weekly Event List</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                      {filteredEvents.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--outline)", margin: 0 }}>No events scheduled for this week.</p>
                      ) : (
                        filteredEvents.map(evt => (
                          <div key={evt.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                            <div>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface)" }}>{evt.title}</span>
                              <span style={{ fontSize: "11px", color: "var(--outline)", marginLeft: "8px" }}>({new Date(evt.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "short" })})</span>
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--primary)" }}>{evt.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeView === "Day" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "16px", color: "var(--on-surface-variant)" }}>Day Schedule</h4>
                    <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 600 }}>
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  
                  <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "12px", padding: "20px" }}>
                    {filteredEvents.length === 0 ? (
                      <div className="no-events-view">
                        <FiCalendar size={32} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No events scheduled for this day.</p>
                        <button 
                          className="btn-secondary" 
                          style={{ fontSize: "12px", marginTop: "8px" }}
                          onClick={() => {
                            setNewEvent(prev => ({ 
                              ...prev, 
                              date: getISODateString(selectedDate),
                              attendees: prev.type === "Personal" ? [getCurrentUserAttendeeName()] : prev.attendees
                            }));
                            setCreateModalOpen(true);
                          }}
                        >
                          Schedule Event
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {filteredEvents.map(evt => (
                          <div 
                            key={evt.id} 
                            style={{ 
                              padding: "16px", 
                              borderRadius: "10px", 
                              background: "rgba(255,255,255,0.02)", 
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderLeft: `4px solid ${evt.type === "Meeting" ? "var(--primary)" : evt.type === "Deadline" ? "var(--error)" : evt.type === "Task" ? "var(--secondary)" : "var(--tertiary)"}`
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <h5 style={{ fontSize: "15px", fontWeight: 600, margin: 0, color: "var(--on-surface)" }}>{evt.title}</h5>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--outline)", display: "flex", alignItems: "center", gap: "4px" }}><FiClock /> {evt.time}</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--outline)", margin: "8px 0 12px 0" }}>{evt.description}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "var(--on-surface-variant)" }}><FiMapPin /> {evt.location}</span>
                              <div style={{ display: "flex" }}>
                                {evt.attendees.map((attendee, attIdx) => (
                                  <img 
                                    key={attIdx} 
                                    src={attendee.avatar} 
                                    alt={attendee.name} 
                                    className="event-attendee-avatar" 
                                    title={attendee.name}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === "Agenda" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "16px", color: "var(--on-surface-variant)" }}>Upcoming Timeline</h4>
                    <span style={{ fontSize: "12px", color: "var(--outline)" }}>Showing {filteredEvents.length} events matching filters</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {isLoadingTasks ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[1, 2, 3, 4].map(idx => (
                          <div key={idx} style={{ display: "flex", gap: "20px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                            <div style={{ width: "70px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                              <Skeleton width="40px" height="12px" borderRadius="4px" />
                              <Skeleton width="30px" height="24px" borderRadius="4px" />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                              <Skeleton width="40%" height="18px" borderRadius="4px" />
                              <Skeleton width="80%" height="14px" borderRadius="4px" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="no-events-view">
                        <FiCalendar size={32} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No upcoming events found.</p>
                      </div>
                    ) : (
                      // Sort events by date
                      [...filteredEvents]
                        .sort((a,b) => new Date(a.date) - new Date(b.date))
                        .map(evt => {
                          const dateObj = new Date(evt.date + "T00:00:00");
                          const formattedDate = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
                          
                          return (
                            <div 
                              key={evt.id} 
                              style={{ 
                                display: "flex", 
                                gap: "20px", 
                                padding: "16px", 
                                background: "rgba(255,255,255,0.02)", 
                                borderRadius: "12px", 
                                border: "1px solid rgba(255,255,255,0.05)" 
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "70px", borderRight: "1px solid rgba(255,255,255,0.05)", paddingRight: "16px", flexShrink: 0 }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--outline)" }}>{dateObj.toLocaleDateString(undefined, { weekday: "short" })}</span>
                                <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--on-surface)" }}>{dateObj.getDate()}</span>
                                <span style={{ fontSize: "11px", color: "var(--outline)" }}>{dateObj.toLocaleDateString(undefined, { month: "short" })}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div>
                                    <h5 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px 0", color: "var(--on-surface)" }}>{evt.title}</h5>
                                    <span className={`event-type-label label-${evt.type.toLowerCase()}`}>{evt.type}</span>
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)" }}>{evt.time}</span>
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--outline)", margin: "8px 0 0 0" }}>{evt.description}</p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Block: Side Agenda & Category Filters */}
            <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Agenda panel for the active date selection (only rendered if Month or Week views are active) */}
              {(activeView === "Month" || activeView === "Week") && (
                <div className="glass-card agenda-panel">
                  <div className="agenda-header">
                    <span className="agenda-date-title">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
                    </span>
                    <div className="agenda-date-subtitle">
                      {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="agenda-events-list custom-scrollbar">
                    {isLoadingTasks ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <CalendarAgendaSkeleton />
                        <CalendarAgendaSkeleton />
                        <CalendarAgendaSkeleton />
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="no-events-view">
                        <FiCalendar size={28} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0, fontSize: "13px" }}>No events scheduled</p>
                      </div>
                    ) : (
                      filteredEvents.map(evt => (
                        <div 
                          key={evt.id} 
                          className={`agenda-card ${evt.type.toLowerCase()}-border`}
                        >
                          <div className="agenda-card-meta">
                            <span className="event-time-badge">
                              <FiClock size={12} />
                              {evt.time}
                            </span>
                            <span className={`event-type-label label-${evt.type.toLowerCase()}`}>
                              {evt.type}
                            </span>
                          </div>
                          
                          <h4 className="agenda-card-title">{evt.title}</h4>
                          <p className="agenda-card-desc">{evt.description}</p>

                          <div className="agenda-card-footer">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div className="event-attendees">
                                {evt.attendees.map((attendee, index) => (
                                  <img 
                                    key={`att-${index}`}
                                    className="event-attendee-avatar" 
                                    src={attendee.avatar} 
                                    alt={attendee.name} 
                                    title={attendee.name}
                                  />
                                ))}
                              </div>
                              {evt.isTask && evt.status && (
                                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(65, 238, 130, 0.12)", color: "var(--secondary)", fontWeight: 600 }}>
                                  {evt.status}
                                </span>
                              )}
                            </div>

                            <button 
                              className="delete-event-btn"
                              onClick={() => handleDeleteEvent(evt.id, evt.title)}
                              title={evt.isTask ? "Task from tasks board" : "Delete event"}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Event Category Filters Card */}
              <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--on-surface)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Filter Categories
                  {isLoadingTasks && (
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 400 }}>
                      (Syncing tasks...)
                    </span>
                  )}
                </h3>
                <div className="category-filters">
                  {[
                    { name: "All", count: allEvents.length },
                    { name: "Meeting", count: allEvents.filter(e => e.type === "Meeting").length, color: "meeting" },
                    { name: "Deadline", count: allEvents.filter(e => e.type === "Deadline").length, color: "deadline" },
                    { name: "Task", count: allEvents.filter(e => e.type === "Task").length, color: "task" },
                    { name: "Personal", count: allEvents.filter(e => e.type === "Personal").length, color: "personal" }
                  ].map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`filter-category-item ${activeCategory === cat.name ? "active" : ""}`}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {cat.color && (
                          <span className={`filter-color-indicator color-indicator-${cat.color}`} />
                        )}
                        <span>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--outline)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "10px" }}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Create Event / Task Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setCreateModalOpen(false);
          setIsAssigneeDropdownOpen(false);
        }} 
        title={newEvent.type === "Task" ? "Create New Task" : "Schedule New Event"}
      >
        <form onSubmit={handleCreateSubmit} className="modal-form">
          {/* Category Selector */}
          <div className="form-group">
            <label htmlFor="evt-type">Category</label>
            <select 
              id="evt-type"
              className="form-select"
              value={newEvent.type}
              onChange={(e) => {
                const nextType = e.target.value;
                setNewEvent(prev => {
                  let updatedAttendees = prev.attendees || [];
                  if (nextType === "Personal") {
                    // On Personal Category selected: first select the current user only
                    const selfName = getCurrentUserAttendeeName();
                    updatedAttendees = [selfName];
                  }

                  return { 
                    ...prev, 
                    type: nextType,
                    attendees: updatedAttendees,
                    assignedTo: nextType === "Task" && (!prev.assignedTo || prev.assignedTo.length === 0) && rawUsers.length > 0
                      ? [rawUsers[0]._id]
                      : prev.assignedTo
                  };
                });
              }}
            >
              <option value="Meeting">Meeting</option>
              <option value="Task">Task</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          {newEvent.type === "Task" ? (
            /* ========================================================
               TASK CREATION FORM - Matching Add New Task in Tasks.jsx
               ======================================================== */
            <>
              {/* Task Title */}
              <div className="form-group">
                <label htmlFor="task-title">Task Title *</label>
                <input 
                  id="task-title"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Design System Implementation"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="task-desc">Description</label>
                <textarea 
                  id="task-desc"
                  rows={3}
                  className="form-textarea custom-scrollbar" 
                  placeholder="Provide details about what needs to be accomplished..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Priority & Status */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    className="form-select"
                    value={newEvent.priority || "Medium"}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    className="form-select"
                    value={newEvent.status || "To Do"}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Process">In Process</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Project */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-duedate">Due Date *</label>
                  <input 
                    id="task-duedate"
                    type="date" 
                    className="form-input" 
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-project">Project</label>
                  <input 
                    id="task-project"
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Website Redesign"
                    value={newEvent.project || ""}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, project: e.target.value }))}
                  />
                </div>
              </div>

              {/* Team Member / Assignee Selector */}
              <div className="form-group" style={{ position: "relative" }} ref={assigneeDropdownRef}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>
                    Assigned To {newEvent.assignedTo?.length > 0 && `(${newEvent.assignedTo.length} selected)`}
                  </label>
                  {rawUsers.length > 1 && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={handleSelectAllAssignees}
                        style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                      >
                        Select All
                      </button>
                      <span style={{ color: "var(--outline-variant)", fontSize: "11px" }}>|</span>
                      <button
                        type="button"
                        onClick={handleClearAssignees}
                        style={{ background: "none", border: "none", color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected Assignees Chips */}
                {newEvent.assignedTo?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                    {newEvent.assignedTo.map(userId => {
                      const userObj = rawUsers.find(u => u._id === userId);
                      const name = userObj ? (userObj.name || userObj.username) : "User";
                      const avatar = userObj?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                      return (
                        <div
                          key={userId}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px 4px 6px",
                            background: "rgba(91, 140, 255, 0.15)",
                            border: "1px solid rgba(91, 140, 255, 0.3)",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "var(--on-surface)"
                          }}
                        >
                          <img src={avatar} alt={name} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAssignee(userId);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--on-surface-variant)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 2px",
                              fontSize: "12px",
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
                    width: "100%",
                    padding: "11px 16px",
                    background: "var(--surface-low)",
                    border: isAssigneeDropdownOpen ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
                    borderRadius: "8px",
                    color: "var(--on-surface)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    boxShadow: isAssigneeDropdownOpen ? "0 0 0 2px rgba(91, 140, 255, 0.2)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: newEvent.assignedTo?.length ? "var(--on-surface)" : "var(--on-surface-variant)", fontSize: "13.5px" }}>
                    <FiUsers size={16} style={{ color: "var(--primary)" }} />
                    <span>
                      {newEvent.assignedTo?.length === 0
                        ? "Select assignees (click to choose)"
                        : `${newEvent.assignedTo.length} person${newEvent.assignedTo.length > 1 ? "s" : ""} assigned`}
                    </span>
                  </div>
                  <span style={{ transform: isAssigneeDropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease", color: "var(--on-surface-variant)", fontSize: "11px" }}>
                    ▼
                  </span>
                </div>

                {/* Assignee Multi-select Popover Dropdown */}
                {isAssigneeDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "var(--surface-card, #1e293b)",
                      border: "1px solid var(--outline-variant)",
                      borderRadius: "12px",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                      zIndex: 100,
                      padding: "8px",
                      maxHeight: "220px",
                      overflowY: "auto"
                    }}
                  >
                    {rawUsers.length === 0 ? (
                      <div style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                        No team members found
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {rawUsers.map(u => {
                          const isSelected = (newEvent.assignedTo || []).includes(u._id);
                          const name = u.name || u.username;
                          const avatar = u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                          return (
                            <div
                              key={u._id}
                              onClick={() => handleToggleAssignee(u._id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                background: isSelected ? "rgba(91, 140, 255, 0.16)" : "transparent",
                                cursor: "pointer",
                                transition: "background 0.15s ease"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <img src={avatar} alt={name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: "13px", fontWeight: isSelected ? 600 : 500, color: isSelected ? "var(--primary)" : "var(--on-surface)" }}>
                                    {name}
                                  </span>
                                  {u.username && u.name && (
                                    <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>@{u.username}</span>
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "4px",
                                  border: isSelected ? "none" : "1.5px solid var(--outline-variant)",
                                  background: isSelected ? "var(--primary)" : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: "12px"
                                }}
                              >
                                {isSelected && "✓"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ========================================================
               EVENT CREATION FORM (Meeting / Personal)
               ======================================================== */
            <>
              <div className="form-group">
                <label htmlFor="evt-title">Event Title *</label>
                <input 
                  id="evt-title"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Design Standup"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="evt-time">Start Time</label>
                  <input 
                    id="evt-time"
                    type="time" 
                    className="form-input" 
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="evt-date">Date *</label>
                  <input 
                    id="evt-date"
                    type="date" 
                    className="form-input" 
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="evt-location">Location / Link</label>
                <input 
                  id="evt-location"
                  type="text" 
                  className="form-input" 
                  placeholder="Room A, Zoom, etc."
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="evt-desc">Description</label>
                <textarea 
                  id="evt-desc"
                  className="form-textarea" 
                  placeholder="Brief description of the event agenda..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>
                    {newEvent.type === "Personal" ? "Participants" : "Invite Team Members"}
                    {newEvent.attendees?.length > 0 && ` (${newEvent.attendees.length} selected)`}
                  </label>
                  {newEvent.attendees?.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAttendeeClear}
                      style={{ background: "none", border: "none", color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Selected Removable Chips */}
                {newEvent.attendees?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px", marginBottom: "8px" }}>
                    {newEvent.attendees.map(name => {
                      const attendeeObj = attendeesList.find(a => a.name === name);
                      const avatar = attendeeObj?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                      const isSelf = name === getCurrentUserAttendeeName();
                      return (
                        <div
                          key={name}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px 4px 6px",
                            background: "rgba(91, 140, 255, 0.15)",
                            border: "1px solid rgba(91, 140, 255, 0.3)",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "var(--on-surface)"
                          }}
                        >
                          <img src={avatar} alt={name} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                          <span>{name} {isSelf && "(You)"}</span>
                          <button
                            type="button"
                            onClick={() => handleAttendeeRemove(name)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--on-surface-variant)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 2px",
                              fontSize: "12px",
                              lineHeight: 1
                            }}
                            title={`Remove ${name}`}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Available Team Member Badges */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  {attendeesList.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "var(--outline)" }}>No other team members yet</span>
                  ) : (
                    attendeesList.map(attendee => {
                      const isInvited = (newEvent.attendees || []).includes(attendee.name);
                      return (
                        <button
                          key={attendee.name}
                          type="button"
                          onClick={() => handleAttendeeToggle(attendee.name)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            border: isInvited ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.06)",
                            background: isInvited ? "rgba(91,140,255,0.15)" : "var(--surface-low)",
                            color: isInvited ? "var(--primary)" : "var(--on-surface-variant)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: isInvited ? 600 : 500,
                            transition: "all 0.2s"
                          }}
                        >
                          <img 
                            src={attendee.avatar} 
                            alt={attendee.name} 
                            style={{ width: "16px", height: "16px", borderRadius: "50%" }} 
                          />
                          <span>{attendee.name.split(" ")[0]}</span>
                          <span style={{ fontSize: "11px", opacity: 0.8 }}>
                            {isInvited ? "✕" : "+"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => {
                setCreateModalOpen(false);
                setIsAssigneeDropdownOpen(false);
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              {newEvent.type === "Task" ? "Create Task" : "Schedule Event"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />

      {/* Floating Hover Event Preview */}
      <AnimatePresence>
        {hoveredCell && tooltipStyle && (
          <motion.div
            initial={{ opacity: 0, y: hoveredCell.rect.top > 240 ? 8 : -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: hoveredCell.rect.top > 240 ? 6 : -6, scale: 0.95 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={tooltipStyle}
            className="calendar-hover-tooltip"
          >
            <div className="calendar-hover-header">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FiCalendar size={13} style={{ color: "var(--primary)" }} />
                <span className="calendar-hover-date">
                  {hoveredCell.date.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span className="calendar-hover-badge">
                {hoveredCell.events.length} {hoveredCell.events.length === 1 ? "Event" : "Events"}
              </span>
            </div>

            <div className="calendar-hover-list custom-scrollbar">
              {hoveredCell.events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className={`calendar-hover-item hover-item-${evt.type.toLowerCase()}`}
                >
                  <div className="calendar-hover-item-top">
                    <span className="calendar-hover-item-title">{evt.title}</span>
                    <span
                      className={`event-type-label label-${evt.type.toLowerCase()}`}
                      style={{ fontSize: "9px", padding: "2px 6px" }}
                    >
                      {evt.type}
                    </span>
                  </div>

                  <div className="calendar-hover-item-meta">
                    <span className="calendar-hover-item-time">
                      <FiClock size={11} /> {evt.time}
                    </span>
                    {evt.location && (
                      <span className="calendar-hover-item-loc">
                        <FiMapPin size={11} /> {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {hoveredCell.events.length > 4 && (
                <div className="calendar-hover-more">
                  +{hoveredCell.events.length - 4} more {hoveredCell.events.length - 4 === 1 ? "event" : "events"}
                </div>
              )}
            </div>

            <div className="calendar-hover-footer">
              Click date to view details
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
