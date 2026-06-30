import React, { useState, useMemo } from "react";
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
  FiUser
} from "react-icons/fi";

const ATTENDEES = [
  { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" },
  { name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" },
  { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" }
];

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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Notification and Toast States
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Meeting",
    date: "",
    time: "10:00",
    location: "",
    attendees: []
  });

  // Dynamic date helper to place initial events relative to current local date
  const relativeDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  // Initial Events list in state
  const [events, setEvents] = useState([
    {
      id: "event-1",
      title: "FlowSync Sprint Planning",
      description: "Review active sprint progress, address blockers, and refine task timelines.",
      type: "Meeting",
      date: relativeDate(0),
      time: "10:00 AM",
      location: "Room A & Google Meet",
      attendees: [ATTENDEES[0], ATTENDEES[1], ATTENDEES[2]]
    },
    {
      id: "event-2",
      title: "Vite App Performance Check",
      description: "Analyze production bundle sizes, review code splitting, and improve asset loads.",
      type: "Task",
      date: relativeDate(0),
      time: "02:30 PM",
      location: "Workspace Studio",
      attendees: [ATTENDEES[0]]
    },
    {
      id: "event-3",
      title: "Design System Audit",
      description: "Audit all glassmorphic components and document color standard tokens.",
      type: "Task",
      date: relativeDate(-2),
      time: "11:00 AM",
      location: "Notion Document",
      attendees: [ATTENDEES[0], ATTENDEES[2]]
    },
    {
      id: "event-4",
      title: "Client Presentation: Nova UI",
      description: "Present working UI mockup designs to stakeholders and collect feedback.",
      type: "Meeting",
      date: relativeDate(2),
      time: "04:00 PM",
      location: "Executive Room",
      attendees: [ATTENDEES[0], ATTENDEES[1]]
    },
    {
      id: "event-5",
      title: "Draft Q4 Product Roadmap",
      description: "Publish initial roadmap outlining release milestones for Q4 deliverables.",
      type: "Deadline",
      date: relativeDate(5),
      time: "11:59 PM",
      location: "Sync Hub",
      attendees: [ATTENDEES[1], ATTENDEES[2]]
    },
    {
      id: "event-6",
      title: "Creative Team Outing",
      description: "Casual lunch and team bonding outing in the park.",
      type: "Personal",
      date: relativeDate(7),
      time: "01:00 PM",
      location: "Central Park Hub",
      attendees: [ATTENDEES[0], ATTENDEES[1], ATTENDEES[2]]
    }
  ]);

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

  // Filter events based on active category, search query, and active view/selected date
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
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
  }, [events, selectedDate, activeView, searchQuery, activeCategory]);

  // Get event indicators for a specific grid cell
  const getCellEvents = (cellDate) => {
    const isoString = getISODateString(cellDate);
    return events.filter(evt => evt.date === isoString);
  };

  // Handle Event Creation
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) {
      setToastMsg("Please fill out Title and Date fields.");
      setToastType("error");
      return;
    }

    const newEventObj = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description || "No description provided.",
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time ? formatTime(newEvent.time) : "All Day",
      location: newEvent.location || "Online",
      attendees: newEvent.attendees.map(name => ATTENDEES.find(a => a.name === name)).filter(Boolean)
    };

    setEvents(prev => [...prev, newEventObj]);
    setCreateModalOpen(false);
    
    // Set selected date to the date of the newly created event to view it
    const parts = newEvent.date.split("-");
    setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    
    setToastMsg(`Successfully scheduled event: "${newEvent.title}"`);
    setToastType("success");
    setNewEvent({
      title: "",
      description: "",
      type: "Meeting",
      date: "",
      time: "10:00",
      location: "",
      attendees: []
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

  // Toggle attendees selections in modal form
  const handleAttendeeToggle = (name) => {
    setNewEvent(prev => {
      const alreadyAdded = prev.attendees.includes(name);
      return {
        ...prev,
        attendees: alreadyAdded 
          ? prev.attendees.filter(n => n !== name)
          : [...prev.attendees, name]
      };
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        {/* Header matching dashboard */}
        <header className="top-header">
          <div className="header-search">
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input 
              type="text" 
              placeholder="Search schedule or tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="header-actions" style={{ position: "relative" }}>
            <button 
              className="btn-primary" 
              onClick={() => {
                // Pre-populate new event's date with the selected date
                setNewEvent(prev => ({ ...prev, date: getISODateString(selectedDate) }));
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

                <div className="calendar-nav-buttons">
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
                            setNewEvent(prev => ({ ...prev, date: getISODateString(selectedDate) }));
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
                    {filteredEvents.length === 0 ? (
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
                    {filteredEvents.length === 0 ? (
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

                            <button 
                              className="delete-event-btn"
                              onClick={() => handleDeleteEvent(evt.id, evt.title)}
                              title="Delete event"
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
                </h3>
                <div className="category-filters">
                  {[
                    { name: "All", count: events.length },
                    { name: "Meeting", count: events.filter(e => e.type === "Meeting").length, color: "meeting" },
                    { name: "Deadline", count: events.filter(e => e.type === "Deadline").length, color: "deadline" },
                    { name: "Task", count: events.filter(e => e.type === "Task").length, color: "task" },
                    { name: "Personal", count: events.filter(e => e.type === "Personal").length, color: "personal" }
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

      {/* Create Event Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Schedule New Event">
        <form onSubmit={handleCreateSubmit} className="modal-form">
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
              <label htmlFor="evt-type">Category</label>
              <select 
                id="evt-type"
                className="form-select"
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="Meeting">Meeting</option>
                <option value="Deadline">Deadline</option>
                <option value="Task">Task</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

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
          </div>

          <div className="form-row">
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
            <label>Invite Team Members</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              {ATTENDEES.map(attendee => {
                const isInvited = newEvent.attendees.includes(attendee.name);
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
                      border: isInvited ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.05)",
                      background: isInvited ? "rgba(91,140,255,0.1)" : "var(--surface-low)",
                      color: isInvited ? "var(--primary)" : "var(--outline)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    <img 
                      src={attendee.avatar} 
                      alt={attendee.name} 
                      style={{ width: "16px", height: "16px", borderRadius: "50%" }} 
                    />
                    {attendee.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}
