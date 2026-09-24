import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";
import "../styles/attendance.css";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCalendar, FiClock, FiSun, FiAlertCircle, FiCheckCircle,
  FiXCircle, FiPlus, FiFilter, FiRefreshCw, FiChevronDown,
  FiSlash, FiLoader
} from "react-icons/fi";
import {
  getAttendence,
  getLeaveDetails,
  fetchLeaveRequests,
  requestLeave,
  cancelLeave,
  getLeaveOptions,
  getAttendanceLogs,
} from "../api/attendenceApi";

/* ─── Animation Variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const STATUS_META = {
  pending:   { color: "#FFB874", bg: "rgba(255,184,116,0.12)", icon: FiClock,        label: "Pending" },
  approved:  { color: "#41EE82", bg: "rgba(65,238,130,0.12)",  icon: FiCheckCircle,  label: "Approved" },
  rejected:  { color: "#FF6363", bg: "rgba(255,99,99,0.12)",   icon: FiXCircle,      label: "Rejected" },
  cancelled: { color: "#8D909F", bg: "rgba(141,144,159,0.12)", icon: FiSlash,        label: "Cancelled" },
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const getAttendanceCycleLabel = () => {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const f = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (day >= 25) {
    return `${f(new Date(year, month, 25))} – ${f(new Date(year, month + 1, 25))}`;
  }
  return `${f(new Date(year, month - 1, 25))} – ${f(new Date(year, month, 25))}`;
};

/* ─── Skeleton ────────────────────────────────────────────────── */
const Skeleton = ({ width = "100%", height = "14px", radius = "6px" }) => (
  <div className="att-skeleton" style={{ width, height, borderRadius: radius }} />
);

/* ─── Main Component ──────────────────────────────────────────── */
export default function Attendance() {
  /* state */
  const [attendance, setAttendance]     = useState(null);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [requests, setRequests]         = useState([]);
  const [dailyLogs, setDailyLogs]       = useState([]);
  const [logsLoading, setLogsLoading]   = useState(true);
  const [options, setOptions]           = useState({ leaveTypes: [], statuses: [] });
  const [loading, setLoading]           = useState(true);
  const [reqLoading, setReqLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [submitting, setSubmitting]     = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [toast, setToast]               = useState(null);
  const calendarRef                     = useRef(null);
  const [form, setForm]                 = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  });

  /* toast helper */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* load summary data */
  const loadSummary = async () => {
    setLoading(true);
    try {
      const [attRes, leaveRes, optRes] = await Promise.allSettled([
        getAttendence(),
        getLeaveDetails(),
        getLeaveOptions(),
      ]);
      if (attRes.status === "fulfilled")   setAttendance(attRes.value.data);
      if (leaveRes.status === "fulfilled") setLeaveDetails(leaveRes.value.data);
      if (optRes.status === "fulfilled")   setOptions(optRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  /* load daily logs */
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await getAttendanceLogs();
      setDailyLogs(res.data?.data ?? []);
    } catch (_) {
      setDailyLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  /* load request list */
  const loadRequests = async (status = filterStatus) => {
    setReqLoading(true);
    try {
      const res = await fetchLeaveRequests({ status });
      setRequests(res.data?.data ?? []);
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadRequests("all");
    loadLogs();
  }, []);

  /* auto-scroll calendar to today */
  useEffect(() => {
    if (!logsLoading && calendarRef.current) {
      const todayEl = calendarRef.current.querySelector(".cal-day-today");
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [logsLoading]);

  /* filter change */
  const handleFilterChange = (s) => {
    setFilterStatus(s);
    loadRequests(s);
  };

  /* submit leave request */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestLeave(form);
      showToast("Leave request submitted successfully.");
      setShowForm(false);
      setForm({ leaveType: "sick", startDate: "", endDate: "", reason: "" });
      await Promise.all([loadSummary(), loadRequests(filterStatus)]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* cancel leave */
  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await cancelLeave(id);
      showToast("Leave request cancelled.");
      await Promise.all([loadSummary(), loadRequests(filterStatus)]);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not cancel request.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  /* derived values */
  const workedHours = attendance?.totalWorkHours ?? 0;
  const targetHours = 160;
  const fillPct     = Math.min(100, Math.round((workedHours / targetHours) * 100));
  const barColor    = fillPct >= 100 ? "#41EE82" : fillPct >= 60 ? "#5B8CFF" : "rgba(65,238,130,0.7)";

  /* ── RENDER ── */
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-search">
            <FiCalendar size={18} color="var(--on-surface-variant)" />
            <span style={{ fontSize: "15px", color: "var(--on-surface-variant)", paddingLeft: "8px" }}>
              Attendance &amp; Leaves
            </span>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => { loadSummary(); loadRequests(filterStatus); }}>
              <FiRefreshCw size={14} style={{ marginRight: "6px" }} /> Refresh
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus size={16} style={{ marginRight: "6px" }} /> Request Leave
            </button>
          </div>
        </header>

        <div className="dashboard-scroll-area custom-scrollbar">
          <motion.div
            className="dashboard-canvas"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: "1400px", padding: "0 20px 40px" }}
          >

            {/* ── Cycle Label ── */}
            <motion.div variants={itemVariants} className="att-cycle-label">
              <FiCalendar size={14} />
              <span>Cycle: <strong>{getAttendanceCycleLabel()}</strong></span>
            </motion.div>

            {/* ── Summary Cards ── */}
            <motion.section variants={itemVariants} className="att-stats-grid">

              {/* Days Present */}
              <div className="att-stat-card glass-card" style={{ borderTop: "2px solid rgba(91,140,255,0.45)" }}>
                <div className="att-stat-header">
                  <span>Days Present</span>
                  <div className="att-stat-icon" style={{ background: "rgba(91,140,255,0.1)", color: "var(--primary)" }}>
                    <FiCalendar size={18} />
                  </div>
                </div>
                {loading ? <Skeleton width="60px" height="38px" /> : (
                  <h2 className="att-stat-value">{attendance?.totalAttendance ?? attendance?.totalattence ?? 0}</h2>
                )}
                <span className="att-stat-sub">days this cycle</span>
              </div>

              {/* Work Time with fill bar */}
              <div className="att-stat-card glass-card att-work-card" style={{ borderTop: "2px solid rgba(65,238,130,0.45)" }}>
                <div style={{ flex: 1 }}>
                  <div className="att-stat-header">
                    <span>Total Work Time</span>
                    <div className="att-stat-icon" style={{ background: "rgba(65,238,130,0.1)", color: "var(--secondary)" }}>
                      <FiClock size={18} />
                    </div>
                  </div>
                  {loading ? <Skeleton width="80px" height="38px" /> : (
                    <h2 className="att-stat-value">{workedHours}h</h2>
                  )}
                  <span className="att-stat-sub">of {targetHours}h target</span>
                  {!loading && (
                    <div className="att-pct-label" style={{ color: barColor }}>{fillPct}% complete</div>
                  )}
                </div>
                {/* Vertical fill bar */}
                <div className="att-vbar-track">
                  <div
                    className="att-vbar-fill"
                    style={{
                      height: loading ? "0%" : `${fillPct}%`,
                      background: `linear-gradient(to top, ${barColor}, rgba(65,238,130,0.25))`,
                      boxShadow: `0 0 12px ${barColor}88`,
                    }}
                  />
                  {fillPct > 0 && <div className="att-vbar-shimmer" style={{ height: `${fillPct}%` }} />}
                </div>
              </div>

              {/* Leave Taken */}
              <div className="att-stat-card glass-card" style={{ borderTop: "2px solid rgba(255,184,116,0.45)" }}>
                <div className="att-stat-header">
                  <span>Leave Taken</span>
                  <div className="att-stat-icon" style={{ background: "rgba(255,184,116,0.1)", color: "var(--tertiary)" }}>
                    <FiSun size={18} />
                  </div>
                </div>
                {loading ? <Skeleton width="50px" height="38px" /> : (
                  <h2 className="att-stat-value">{leaveDetails?.approvedLeaves ?? 0}</h2>
                )}
                <span className="att-stat-sub">{leaveDetails?.remainingLeavesofMonth ?? 0} remaining this month</span>
                {!loading && (
                  <div className="att-leave-mini-row">
                    <span className="att-mini-chip" style={{ background: "rgba(255,99,99,0.12)", color: "#FF6363" }}>
                      {leaveDetails?.rejectedLeaves ?? 0} rejected
                    </span>
                    <span className="att-mini-chip" style={{ background: "rgba(255,184,116,0.12)", color: "#FFB874" }}>
                      {leaveDetails?.pendingLeaves ?? 0} pending
                    </span>
                  </div>
                )}
              </div>

              {/* Pending Requests */}
              {(() => {
                const pendingCount = requests.filter(r => r.status === "pending").length;
                const isAlert = pendingCount > 0;
                return (
                  <div className="att-stat-card glass-card" style={{ borderTop: `2px solid ${isAlert ? "rgba(255,99,99,0.5)" : "rgba(255,255,255,0.08)"}` }}>
                    <div className="att-stat-header">
                      <span>Pending Requests</span>
                      <div className="att-stat-icon" style={{ background: isAlert ? "rgba(255,99,99,0.1)" : "rgba(255,255,255,0.05)", color: isAlert ? "#FF6363" : "var(--outline)" }}>
                        <FiAlertCircle size={18} />
                      </div>
                    </div>
                    {reqLoading ? <Skeleton width="40px" height="38px" /> : (
                      <h2 className="att-stat-value" style={{ color: isAlert ? "#FF6363" : "var(--on-surface)" }}>{pendingCount}</h2>
                    )}
                    <span className="att-stat-sub">{pendingCount === 0 ? "No pending requests" : "awaiting approval"}</span>
                  </div>
                );
              })()}

            </motion.section>

            {/* ── Attendance Calendar ── */}
            <motion.section variants={itemVariants} className="glass-card att-cal-section">
              <div className="att-cal-header">
                <h3>Monthly Calendar</h3>
                <div className="att-cal-legend">
                  {[
                    { type: "full",    label: "Full Day",  color: "#41EE82" },
                    { type: "half",    label: "Half Day",  color: "#5B8CFF" },
                    { type: "leave",   label: "Leave",     color: "#FFB874" },
                    { type: "holiday", label: "Holiday",   color: "#C77DFF" },
                    { type: "absent",  label: "Absent",    color: "#FF6363" },
                    { type: "weekend", label: "Weekend",   color: "rgba(255,255,255,0.12)" },
                  ].map(({ type, label, color }) => (
                    <div key={type} className="att-legend-item">
                      <span className="att-legend-dot" style={{ background: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {logsLoading ? (
                <div className="att-cal-scroll">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className="att-day-skeleton att-skeleton" />
                  ))}
                </div>
              ) : (
                <div className="att-cal-scroll" ref={calendarRef}>
                  {dailyLogs.map((log) => {
                    const d      = new Date(log.date);
                    const dayNum = d.getDate();
                    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                    const monthAbbr = d.toLocaleDateString("en-US", { month: "short" });
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const isToday  = log.date === todayStr;

                    const TYPE_STYLE = {
                      full:    { bg: "rgba(65,238,130,0.18)",  border: "#41EE82", dot: "#41EE82",  label: "Full" },
                      half:    { bg: "rgba(91,140,255,0.18)",  border: "#5B8CFF", dot: "#5B8CFF",  label: "Half" },
                      leave:   { bg: "rgba(255,184,116,0.18)", border: "#FFB874", dot: "#FFB874",  label: "Leave" },
                      holiday: { bg: "rgba(199,125,255,0.18)", border: "#C77DFF", dot: "#C77DFF",  label: "Holiday" },
                      absent:  { bg: "rgba(255,99,99,0.10)",   border: "rgba(255,99,99,0.4)", dot: "#FF6363", label: "Absent" },
                      weekend: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", dot: "rgba(255,255,255,0.2)", label: "" },
                      future:  { bg: "transparent",            border: "rgba(255,255,255,0.06)", dot: "transparent", label: "" },
                    };
                    const style = TYPE_STYLE[log.type] ?? TYPE_STYLE.absent;

                    return (
                      <div
                        key={log.date}
                        className={`att-cal-day ${isToday ? "cal-day-today" : ""} ${log.type === "weekend" ? "cal-day-weekend" : ""} ${log.isFuture ? "cal-day-future" : ""}`}
                        style={{
                          background: style.bg,
                          borderColor: isToday ? "var(--primary)" : style.border,
                          boxShadow: isToday ? "0 0 0 2px var(--primary), 0 4px 16px rgba(91,140,255,0.3)" : "none",
                        }}
                        title={`${dayName}, ${monthAbbr} ${dayNum} — ${style.label || log.type}`}
                      >
                        <span className="cal-day-name">{dayName}</span>
                        <span className="cal-day-num" style={{ color: isToday ? "var(--primary)" : "var(--on-surface)" }}>
                          {dayNum}
                        </span>
                        <span className="cal-day-month">{monthAbbr}</span>
                        <div
                          className="cal-day-dot"
                          style={{ background: style.dot }}
                        />
                        {style.label && (
                          <span className="cal-day-label" style={{ color: style.dot }}>
                            {style.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.section>

            {/* ── Leave Requests Table ── */}
            <motion.section variants={itemVariants} className="glass-card att-requests-section">
              <div className="att-requests-header">
                <h3>Leave Requests</h3>
                <div className="att-filter-row">
                  <FiFilter size={14} color="var(--on-surface-variant)" />
                  <div className="att-filter-tabs">
                    {["all", "pending", "approved", "rejected", "cancelled"].map((s) => (
                      <button
                        key={s}
                        className={`att-filter-tab ${filterStatus === s ? "active" : ""}`}
                        onClick={() => handleFilterChange(s)}
                        style={filterStatus === s && s !== "all" ? { color: STATUS_META[s]?.color } : {}}
                      >
                        {s === "all" ? "All" : STATUS_META[s]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {reqLoading ? (
                <div className="att-list">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="att-request-row att-skeleton-row">
                      <Skeleton width="90px" height="14px" />
                      <Skeleton width="140px" height="14px" />
                      <Skeleton width="60px" height="22px" radius="20px" />
                      <Skeleton width="70px" height="30px" radius="8px" />
                    </div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="att-empty">
                  <FiCalendar size={36} style={{ opacity: 0.2, marginBottom: "12px" }} />
                  <p>No leave requests found.</p>
                  <button className="btn-primary" style={{ marginTop: "12px" }} onClick={() => setShowForm(true)}>
                    <FiPlus size={14} style={{ marginRight: "6px" }} /> Request Leave
                  </button>
                </div>
              ) : (
                <div className="att-list">
                  {/* Table Head */}
                  <div className="att-list-head">
                    <span>Type</span>
                    <span>Duration</span>
                    <span>Reason</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {/* Rows */}
                  <AnimatePresence initial={false}>
                    {requests.map((req) => {
                      const meta = STATUS_META[req.status] ?? STATUS_META.pending;
                      const Icon = meta.icon;
                      const canCancel = req.status === "pending";
                      return (
                        <motion.div
                          key={req._id}
                          className="att-request-row"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                        >
                          {/* Type chip */}
                          <span className="att-type-chip">
                            {options.leaveTypes.find(t => t.value === req.leaveType)?.label ?? req.leaveType}
                          </span>

                          {/* Duration */}
                          <span className="att-dates">
                            <FiCalendar size={12} />
                            {fmt(req.startDate)} → {fmt(req.endDate)}
                          </span>

                          {/* Reason */}
                          <span className="att-reason" title={req.reason}>{req.reason}</span>

                          {/* Status badge */}
                          <span className="att-status-badge" style={{ background: meta.bg, color: meta.color }}>
                            <Icon size={12} />
                            {meta.label}
                          </span>

                          {/* Cancel button */}
                          <div>
                            {canCancel ? (
                              <button
                                className="att-cancel-btn"
                                onClick={() => handleCancel(req._id)}
                                disabled={cancellingId === req._id}
                              >
                                {cancellingId === req._id
                                  ? <FiLoader size={13} className="att-spin" />
                                  : <><FiXCircle size={13} /> Cancel</>}
                              </button>
                            ) : (
                              <span className="att-no-action">—</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

          </motion.div>
        </div>
      </div>

      {/* ── Request Leave Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="att-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="att-modal glass-card"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="att-modal-header">
                <h3><FiCalendar size={18} /> Request Leave</h3>
                <button className="att-modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form className="att-form" onSubmit={handleSubmit}>
                {/* Leave Type */}
                <label>
                  <span>Leave Type</span>
                  <div className="att-select-wrapper">
                    <select
                      value={form.leaveType}
                      onChange={(e) => setForm(f => ({ ...f, leaveType: e.target.value }))}
                      required
                    >
                      {options.leaveTypes.length > 0
                        ? options.leaveTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))
                        : <>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="earned">Earned Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                            <option value="other">Other</option>
                          </>
                      }
                    </select>
                    <FiChevronDown size={15} className="att-select-arrow" />
                  </div>
                </label>

                {/* Date Row */}
                <div className="att-date-row">
                  <label>
                    <span>Start Date</span>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    <span>End Date</span>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate}
                      onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                      required
                    />
                  </label>
                </div>

                {/* Reason */}
                <label>
                  <span>Reason</span>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe the reason for your leave..."
                    value={form.reason}
                    onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                    required
                  />
                </label>

                <div className="att-modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                    Discard
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting
                      ? <><FiLoader size={14} className="att-spin" /> Submitting…</>
                      : <><FiCheckCircle size={14} /> Submit Request</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`att-toast att-toast-${toast.type}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
