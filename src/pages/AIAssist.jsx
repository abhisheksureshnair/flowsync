import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import "../styles/aiassist.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCpu,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiHelpCircle,
  FiX,
  FiCoffee,
  FiBookOpen,
  FiSettings,
  FiAlertTriangle,
  FiSearch,
  FiBell,
  FiPlus,
  FiUsers,
  FiMessageSquare
} from "react-icons/fi";
import flowAiAvatar from "../assets/flow-ai-avatar.png";
import flowsyncIcon from "../assets/flowsync-icon.png";
import { addModel, getAiAssistence, fetchAIModels, messageAI } from "../api/aiassistenceApi";
import { getUserTask } from "../api/taskApi";
import LiquidEther from "../components/ui/LiquidEther";
import RippleGrid from "../components/ui/RippleGrid";
import { Skeleton, SkeletonCircle, SkeletonText } from "../components/ui/Skeleton";

const generateMsgId = (prefix) => `${prefix}-${Date.now()}`;

function AIAssist() {
  const navigate = useNavigate();
  const [aiData, setAiData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noProvider, setNoProvider] = useState(false);
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  // Local AI Configuration States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSavedModels, setShowSavedModels] = useState(false);
  const [savedModels, setSavedModels] = useState([]);
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    baseUrl: "",
    model: "",
    provider: "",
    temperature: "0.7",
    maxTokens: "1024"
  });

  const clearSettingsForm = () => {
    setApiSettings({
      apiKey: "",
      baseUrl: "",
      model: "",
      provider: "",
      temperature: "0.7",
      maxTokens: "1024"
    });
  };

  const loadSavedModels = async () => {
    try {
      const response = await fetchAIModels();
      if (response && response.data && response.data.success) {
        setSavedModels(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch AI models:", err);
    }
  };

  const handleOpenDrawer = () => {
    clearSettingsForm();
    loadSavedModels();
    setIsSettingsOpen(true);
  };

  const handleCloseDrawer = () => {
    clearSettingsForm();
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = async (e) => {
    if (e) e.preventDefault();

    const data = { 
      apiKey: apiSettings.apiKey, 
      baseUrl: apiSettings.baseUrl, 
      model: apiSettings.model, 
      provider: apiSettings.provider, 
      temperature: parseFloat(apiSettings.temperature), 
      maxTokens: parseInt(apiSettings.maxTokens) 
    };

    try {
      const response = await addModel(data);
      
      if (response && response.status === 200) {
        // If response is successful, persist to localStorage
        localStorage.setItem("apiKey", apiSettings.apiKey);
        localStorage.setItem("baseUrl", apiSettings.baseUrl);
        localStorage.setItem("model", apiSettings.model);
        localStorage.setItem("provider", apiSettings.provider);
        localStorage.setItem("temperature", apiSettings.temperature);
        localStorage.setItem("maxTokens", apiSettings.maxTokens);

        clearSettingsForm();
        setIsSettingsOpen(false);
        setToastMsg("AI Configuration saved successfully!");
        setToastType("success");

        // Re-trigger AI analysis and reload saved models
        fetchAiData();
        loadSavedModels();
      } else {
        setToastMsg(response?.data?.message || "Failed to save AI configuration (status not 200).");
        setToastType("error");
      }
    } catch (err) {
      console.error("Failed to add AI model configuration:", err);
      let errorMsg;
      if (err.response) {
        errorMsg = err.response.data?.error?.message || err.response.data?.message || `Error ${err.response.status}: Failed to save.`;
      } else if (err.request) {
        errorMsg = "Unable to connect to the backend server.";
      } else {
        errorMsg = err.message;
      }
      setToastMsg(errorMsg);
      setToastType("error");
    }
  };

  // Interactive Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am Flow AI. I've analyzed your workspace tasks. You can ask me questions like 'What is my next deadline?', 'Summarize my workload', or 'Can I finish all tasks today?'"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const chatEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const configScrollRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  const fetchAiData = async () => {
    setIsAiLoading(true);
    setError(null);
    try {
      const response = await getAiAssistence();
      if (response && response.data) {
        const rawData = response.data.data;
        let parsed;
        if (typeof rawData === 'string') {
          parsed = JSON.parse(rawData);
        } else {
          parsed = rawData;
        }
        setAiData(parsed);
        setNoProvider(false);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to load AI Assist data:", err);
      let errorMsg;
      let isNoProvider = false;

      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.error?.message || err.response.data?.message || "";

        if (status === 404 && msg.toLowerCase().includes("no ai provider connected")) {
          errorMsg = "No AI provider connected.";
          isNoProvider = true;
        } else {
          switch (status) {
            case 401:
              errorMsg = "Invalid NVIDIA API Key.";
              break;
            case 403:
              errorMsg = "Access denied to this NVIDIA model.";
              break;
            case 404:
              errorMsg = "Model or endpoint not found.";
              break;
            case 408:
              errorMsg = "AI request timed out.";
              break;
            case 429:
              errorMsg = "AI service is busy or rate limit exceeded. Please try again in a few moments.";
              break;
            case 500:
              errorMsg = "NVIDIA AI service encountered an internal error.";
              break;
            case 503:
              errorMsg = "NVIDIA AI service is temporarily unavailable.";
              break;
            default:
              errorMsg = msg || "Unknown AI error.";
          }
        }
      } else if (err.request) {
        errorMsg = "Unable to connect to AI.";
      } else {
        errorMsg = err.message || "Unknown AI error.";
      }

      setNoProvider(isNoProvider);
      setError(errorMsg);

      if (!isNoProvider) {
        setToastMsg(errorMsg);
        setToastType("error");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getUserTask();
      const raw = response.data?.data || [];
      setTasks(raw);
    } catch (err) {
      console.error("Failed to load tasks for Flow AI:", err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchAiData();
      fetchTasks();
      loadSavedModels();
    });
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Scroll config settings drawer to top when showing saved models
  useEffect(() => {
    if (showSavedModels && configScrollRef.current) {
      configScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showSavedModels]);

  // Local Task Workload Helper Calculations
  const getLocalSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTasks = tasks.filter(t => t.status !== "Completed" && t.status !== "done");
    const completedTasks = tasks.filter(t => t.status === "Completed" || t.status === "done");

    let overdueCount = 0;
    let dueTodayCount = 0;
    let totalWorkloadMins = 0;

    activeTasks.forEach(task => {
      let estMinutes = 120; // Default 2 hours
      if (task.priority === "High") estMinutes = 210;
      else if (task.priority === "Low") estMinutes = 60;

      totalWorkloadMins += estMinutes;

      if (task.dueDate) {
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() < today.getTime()) {
          overdueCount++;
        } else if (due.getTime() === today.getTime()) {
          dueTodayCount++;
        }
      }
    });

    const totalCount = tasks.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedTasks.length / totalCount) * 100) : 0;

    return {
      activeCount: activeTasks.length,
      overdueCount,
      dueTodayCount,
      workloadMinutes: totalWorkloadMins,
      completionPercentage,
      completedCount: completedTasks.length
    };
  };

  const localSummary = getLocalSummary();
  const isLoading = isAiLoading || isTasksLoading;

  // Helper to format workload hours
  const formatWorkload = (mins) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m}m`;
    return `${hrs}h ${m > 0 ? m + "m" : ""}`;
  };

  // Chat/Ask handler
  const handleChatSubmit = async (queryText) => {
    const text = queryText || inputVal;
    if (!text.trim()) {
      setIsChatOpen(true);
      return;
    }

    if (!queryText) setInputVal("");

    const newMsg = { id: generateMsgId("chat"), role: "user", content: text };
    setChatHistory(prev => [...prev, newMsg]);
    setIsChatOpen(true);
    setIsTyping(true);

    try {
      const response = await messageAI({ message: text });
      let reply = "";
      if (response && response.data && response.data.success) {
        reply = response.data.data;
      } else {
        reply = response?.data?.message || "Sorry, I couldn't process your request.";
      }
      setChatHistory(prev => [...prev, {
        id: generateMsgId("chat-reply"),
        role: "assistant",
        content: reply
      }]);
    } catch (err) {
      console.error("Failed to get AI response:", err);
      let errorMsg = "Sorry, there was an error communicating with the AI service.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setChatHistory(prev => [...prev, {
        id: generateMsgId("chat-reply"),
        role: "assistant",
        content: `Error: ${errorMsg}`
      }]);
      setToastMsg(errorMsg);
      setToastType("error");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input type="text" placeholder="Search tasks, docs, or AI insights..." />
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
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Recent Alerts</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ padding: '6px', background: 'rgba(91,140,255,0.1)', color: 'var(--primary)', borderRadius: '50%' }}>
                        <FiCheckCircle size={14} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface)' }}>AI analysis complete.</p>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Just now</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="ai-dashboard-content custom-scrollbar">
        {noProvider ? (
          <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <LiquidEther
                colors={['#5227FF', '#FF9FFC', '#B497CF']}
                mouseForce={20}
                cursorSize={100}
                isViscous={false}
                viscous={30}
                iterationsViscous={32}
                iterationsPoisson={32}
                resolution={0.5}
                isBounce={false}
                autoDemo={true}
                autoSpeed={0.5}
                autoIntensity={2.2}
                takeoverDuration={0.25}
                autoResumeDelay={3000}
                autoRampDuration={0.6}
              />
            </div>

            {/* Dark blur overlay to keep typography highly readable */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 15, 0.45)', backdropFilter: 'blur(4px)', zIndex: 1 }} />

            {/* Centered glassmorphic card */}
            <div className="glass-card" style={{ position: 'relative', zIndex: 2, padding: '48px 40px', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
              <div className="ai-avatar-glow" style={{ width: '100px', height: '100px', marginBottom: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={flowAiAvatar} alt="Flow AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.5px', color: 'var(--on-surface)' }}>Flow AI Connection</h2>
              <p style={{ fontSize: '14.5px', color: 'var(--on-surface-variant)', lineHeight: 1.6, margin: '0 0 32px 0', opacity: 0.85 }}>
                Activate the intelligence layer. Connect Flow AI to NVIDIA NIM or another preferred LLM service to unlock automated task priority queues and workload recommendations.
              </p>
              <button
                className="btn-primary"
                onClick={handleOpenDrawer}
                style={{ padding: '14px 32px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(91,140,255,0.25)', border: 'none', cursor: 'pointer' }}
              >
                <FiSettings size={18} /> Connect AI Provider
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <header className="ai-header-section">
              <div className="ai-profile-welcome">
                <div className="ai-avatar-glow" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={flowAiAvatar} alt="Flow AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Flow AI</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--on-surface-variant)', opacity: 0.8 }}>
                    Good Morning, {user.name} 👋
                  </p>
                </div>
              </div>

              <div className="ai-stats-row" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="ai-stat-mini-card">
                  <span className="label">Active</span>
                  <span className="val">{isLoading ? <Skeleton width="28px" height="18px" borderRadius="4px" /> : localSummary.activeCount}</span>
                </div>
                <div className="ai-stat-mini-card" style={{ borderColor: localSummary.overdueCount > 0 ? 'rgba(255,114,94,0.3)' : '' }}>
                  <span className="label" style={{ color: localSummary.overdueCount > 0 ? 'var(--error)' : '' }}>Overdue</span>
                  <span className="val" style={{ color: localSummary.overdueCount > 0 ? 'var(--error)' : '' }}>
                    {isLoading ? <Skeleton width="28px" height="18px" borderRadius="4px" /> : localSummary.overdueCount}
                  </span>
                </div>
                <div className="ai-stat-mini-card">
                  <span className="label">Due Today</span>
                  <span className="val">{isLoading ? <Skeleton width="28px" height="18px" borderRadius="4px" /> : localSummary.dueTodayCount}</span>
                </div>
                <div className="ai-stat-mini-card">
                  <span className="label">Workload</span>
                  <span className="val" style={{ fontSize: '20px', fontWeight: 800 }}>
                    {isLoading ? <Skeleton width="54px" height="18px" borderRadius="4px" /> : formatWorkload(localSummary.workloadMinutes)}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  onClick={handleOpenDrawer}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    marginLeft: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  title="AI Settings"
                >
                  <FiSettings size={20} />
                </button>
              </div>
            </header>

            {/* Input Bar & Suggestion Chips */}
            {!isChatOpen && (
              <div className="ai-prompt-box-container">
                <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}>
                  <div className="ai-prompt-glass-input">
                    <FiHelpCircle size={20} color="var(--primary)" />
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onFocus={() => setIsChatOpen(true)}
                      placeholder="Ask Flow AI about your tasks..."
                      className="ai-prompt-input"
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '8px 16px', borderRadius: '10px' }}
                      disabled={isTyping}
                    >
                      Ask
                    </button>
                  </div>
                </form>

                <div className="ai-chips-container">
                  <button className="ai-action-chip" onClick={() => handleChatSubmit("What should I work on next?")}>
                    "What's my next deadline?"
                  </button>
                  <button className="ai-action-chip" onClick={() => handleChatSubmit("Summarize my workload")}>
                    "Summarize my workload"
                  </button>
                  <button className="ai-action-chip" onClick={() => handleChatSubmit("Can I finish all my work today?")}>
                    "Can I finish all tasks today?"
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '0 32px 24px' }}>
                <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 114, 94, 0.08)', border: '1px solid rgba(255, 114, 94, 0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <FiAlertTriangle size={24} style={{ color: 'var(--error)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--on-surface)', fontWeight: 600 }}>AI Service Error</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--on-surface-variant)', opacity: 0.9 }}>{error}</p>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', whiteSpace: 'nowrap' }}
                    onClick={fetchAiData}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            {/* Main Content Grid */}
            <motion.div layout className="ai-dashboard-grid" style={isChatOpen ? { paddingTop: '24px' } : {}}>
              {/* Left Column */}
              <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Recommended Next Card */}
                <motion.div layout whileHover={{ y: -4 }} className="ai-card-glow ai-recommended-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="ai-badge-purple">Recommended Next</span>
                    {aiData?.recommendedTask?.estimatedTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)' }}>
                        <FiClock size={14} />
                        <span>{aiData.recommendedTask.estimatedTime}</span>
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                      <Skeleton width="65%" height="26px" borderRadius="6px" />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Skeleton width="110px" height="16px" borderRadius="4px" />
                        <Skeleton width="120px" height="16px" borderRadius="4px" />
                      </div>
                      <div className="ai-quote-box" style={{ minHeight: '64px' }}>
                        <SkeletonText lines={2} gap="8px" lastLineWidth="70%" />
                      </div>
                      <Skeleton width="140px" height="42px" borderRadius="12px" />
                    </div>
                  ) : aiData?.recommendedTask ? (
                    <>
                      <h2 style={{ margin: '16px 0 8px', fontSize: '24px', fontWeight: 700 }}>
                        {aiData.recommendedTask.title}
                      </h2>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                          ⚠️ {aiData.recommendedTask.priority} Priority
                        </span>
                        <span style={{ color: 'var(--outline)' }}>
                          • Due {aiData.recommendedTask.dueDateLabel || "soon"}
                        </span>
                      </div>

                      <div className="ai-quote-box">
                        "{aiData.recommendedTask.reason}"
                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--primary)' }}>
                          — FLOW AI INSIGHT
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        style={{ background: 'var(--primary)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}
                        onClick={() => {
                          setToastMsg(`Started working on: ${aiData.recommendedTask.title}`);
                          setToastType("success");
                        }}
                      >
                        Start Working
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      <FiCheckCircle size={40} style={{ color: 'var(--secondary)', marginBottom: '12px' }} />
                      <h3 style={{ margin: 0 }}>All Caught Up!</h3>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.8 }}>No recommendations available.</p>
                    </div>
                  )}
                </motion.div>

                {/* Smart Priority Queue */}
                <motion.div layout whileHover={{ y: -4 }} className="ai-card-glow">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Smart Priority Queue</h3>
                    <span style={{ fontSize: '12px', color: 'var(--outline)' }}>Optimized for productivity</span>
                  </div>

                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                      {[1, 2, 3].map(idx => (
                        <div key={idx} className="ai-queue-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <SkeletonCircle size="24px" />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <Skeleton width="70%" height="16px" borderRadius="4px" />
                              <Skeleton width="40%" height="12px" borderRadius="4px" />
                            </div>
                          </div>
                          <Skeleton width="60px" height="20px" borderRadius="6px" />
                        </div>
                      ))}
                    </div>
                  ) : !aiData?.priorityQueue || aiData.priorityQueue.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--outline)', textAlign: 'center', padding: '16px 0' }}>
                      No tasks in the queue.
                    </p>
                  ) : (
                    <div className="ai-queue-list">
                      {aiData.priorityQueue.map((item, idx) => {
                        const isUrgent = item.label?.toLowerCase().includes("today") || item.priority === "High";
                        let tagBg = "rgba(255, 255, 255, 0.05)";
                        let tagColor = "var(--on-surface-variant)";

                        if (isUrgent) {
                          tagBg = "rgba(255,114,94,0.15)";
                          tagColor = "var(--error)";
                        } else if (item.priority === "Medium") {
                          tagBg = "rgba(255,184,116,0.15)";
                          tagColor = "var(--tertiary)";
                        }

                        return (
                          <div key={idx} className="ai-queue-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ color: isUrgent ? 'var(--error)' : 'var(--primary)' }}>
                                <FiTrendingUp size={18} />
                              </div>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                                  Priority: {item.priority}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: tagBg, color: tagColor }}>
                                {item.label || "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Upcoming Deadlines (Only when chat is open) */}
                {isChatOpen && (
                  <motion.div layout layoutId="ai-upcoming-deadlines" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Upcoming Deadlines</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {isLoading ? (
                        [1, 2, 3].map(idx => (
                          <div key={idx} className="deadline-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton width="55%" height="16px" borderRadius="4px" />
                            <Skeleton width="70px" height="14px" borderRadius="4px" />
                          </div>
                        ))
                      ) : !aiData?.priorityQueue || aiData.priorityQueue.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--outline)' }}>No upcoming deadlines.</p>
                      ) : (
                        aiData.priorityQueue.map((t, idx) => (
                          <div key={idx} className="deadline-item">
                            <span style={{ fontSize: '14px', color: 'var(--on-surface)', fontWeight: 500 }}>{t.title}</span>
                            <span style={{ fontSize: '12px', color: t.label?.toLowerCase().includes("today") || t.label?.toLowerCase().includes("high") ? 'var(--error)' : 'var(--outline)' }}>
                              {t.label}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Analysis & Completion History (Only when chat is open) */}
                {isChatOpen && (
                  <motion.div layout layoutId="ai-completion-analytics" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>Completion Analytics</h3>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                        <SkeletonCircle size="70px" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <Skeleton width="110px" height="22px" borderRadius="4px" />
                          <Skeleton width="140px" height="14px" borderRadius="4px" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="var(--secondary)"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * (localSummary.completionPercentage / 100))}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>
                              {localSummary.completionPercentage}%
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '22px', fontWeight: 800 }}>
                              {localSummary.completionPercentage > 70 ? "On Track" : localSummary.completionPercentage > 40 ? "Steady Progress" : "Starting Up"}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                              {localSummary.completionPercentage > 70 ? "Velocity maintains progress" : "Keep pushing tasks to finish"}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 600 }}>
                          {localSummary.completionPercentage > 70 ? "Healthy work rhythm detected" : "Ready to prioritize and focus"}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Risk Analysis (Only when chat is open) */}
                {isChatOpen && (
                  <motion.div layout layoutId="ai-risk-analysis" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>⚠️ Risk Analysis</h3>

                    {isLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Skeleton width="60%" height="16px" borderRadius="4px" />
                          <Skeleton width="60px" height="18px" borderRadius="6px" />
                        </div>
                        <Skeleton width="100%" height="40px" borderRadius="8px" />
                      </div>
                    ) : aiData?.riskAnalysis ? (
                      <>
                        <div className="deadline-item" style={{ border: 'none' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                              {aiData.riskAnalysis.taskTitle}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                              Due {aiData.riskAnalysis.dueDateLabel}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,114,94,0.15)', color: 'var(--error)' }}>
                            {aiData.riskAnalysis.riskLevel || "At Risk"}
                          </span>
                        </div>

                        <div className="risk-alert-box">
                          <strong>AI SUGGESTION:</strong> {aiData.riskAnalysis.suggestion}
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: '16px 0 0', fontSize: '13px', color: 'var(--outline)' }}>
                        All tasks are on track. No high-risk items identified!
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Right Column */}
              <motion.div layout className="ai-right-stack">
                <AnimatePresence>
                  {isChatOpen && (
                    <motion.div
                      layout
                      className="ai-card-glow ai-chat-inline-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'calc(100vh - 210px)' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
                    >
                      <RippleGrid
                        enableRainbow={false}
                        gridColor="#5b8cff"
                        rippleIntensity={0.03}
                        gridSize={12}
                        gridThickness={10}
                        mouseInteraction={true}
                        mouseInteractionRadius={1.0}
                        opacity={0.3}
                      />

                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                        <div className="ai-chat-drawer-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={flowsyncIcon} alt="FlowSync" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                            <span style={{ fontWeight: 700 }}>Flow AI Assistant</span>
                          </div>
                          <button className="icon-btn" onClick={() => setIsChatOpen(false)} type="button">
                            <FiX size={20} />
                          </button>
                        </div>

                        <div ref={chatMessagesRef} className="ai-chat-drawer-messages custom-scrollbar">
                          {chatHistory.map(msg => (
                            <div key={msg.id} className={`ai-message ${msg.role}`} style={{ maxWidth: '90%' }}>
                              <div className="ai-message-bubble" style={{ fontSize: '13.5px' }}>
                                {msg.content.split("\n").map((line, i) => (
                                  <p key={i} style={{ margin: '0 0 6px 0' }}>
                                    {line.split("**").map((part, idx) => idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="ai-message assistant">
                              <div className="ai-message-bubble">
                                <div className="typing-indicator">
                                  <div className="typing-dot"></div>
                                  <div className="typing-dot"></div>
                                  <div className="typing-dot"></div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        <div className="ai-chat-drawer-input-area">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleChatSubmit();
                            }}
                            style={{ display: 'flex', gap: '10px' }}
                          >
                            <input
                              type="text"
                              className="ai-prompt-input"
                              value={inputVal}
                              onChange={(e) => setInputVal(e.target.value)}
                              placeholder="Ask another question..."
                              autoFocus
                              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                              Send
                            </button>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upcoming Deadlines (Only when chat is closed) */}
                {!isChatOpen && (
                  <motion.div layout layoutId="ai-upcoming-deadlines" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Upcoming Deadlines</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {isLoading ? (
                        [1, 2, 3].map(idx => (
                          <div key={idx} className="deadline-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton width="55%" height="16px" borderRadius="4px" />
                            <Skeleton width="70px" height="14px" borderRadius="4px" />
                          </div>
                        ))
                      ) : !aiData?.priorityQueue || aiData.priorityQueue.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--outline)' }}>No upcoming deadlines.</p>
                      ) : (
                        aiData.priorityQueue.map((t, idx) => (
                          <div key={idx} className="deadline-item">
                            <span style={{ fontSize: '14px', color: 'var(--on-surface)', fontWeight: 500 }}>{t.title}</span>
                            <span style={{ fontSize: '12px', color: t.label?.toLowerCase().includes("today") || t.label?.toLowerCase().includes("high") ? 'var(--error)' : 'var(--outline)' }}>
                              {t.label}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Analysis & Completion History (Only when chat is closed) */}
                {!isChatOpen && (
                  <motion.div layout layoutId="ai-completion-analytics" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>Completion Analytics</h3>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                        <SkeletonCircle size="70px" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <Skeleton width="110px" height="22px" borderRadius="4px" />
                          <Skeleton width="140px" height="14px" borderRadius="4px" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="var(--secondary)"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * (localSummary.completionPercentage / 100))}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>
                              {localSummary.completionPercentage}%
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '22px', fontWeight: 800 }}>
                              {localSummary.completionPercentage > 70 ? "On Track" : localSummary.completionPercentage > 40 ? "Steady Progress" : "Starting Up"}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                              {localSummary.completionPercentage > 70 ? "Velocity maintains progress" : "Keep pushing tasks to finish"}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 600 }}>
                          {localSummary.completionPercentage > 70 ? "Healthy work rhythm detected" : "Ready to prioritize and focus"}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Risk Analysis (Only when chat is closed) */}
                {!isChatOpen && (
                  <motion.div layout layoutId="ai-risk-analysis" whileHover={{ y: -4 }} className="ai-card-glow">
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>⚠️ Risk Analysis</h3>

                    {isLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Skeleton width="60%" height="16px" borderRadius="4px" />
                          <Skeleton width="60px" height="18px" borderRadius="6px" />
                        </div>
                        <Skeleton width="100%" height="40px" borderRadius="8px" />
                      </div>
                    ) : aiData?.riskAnalysis ? (
                      <>
                        <div className="deadline-item" style={{ border: 'none' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                              {aiData.riskAnalysis.taskTitle}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                              Due {aiData.riskAnalysis.dueDateLabel}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,114,94,0.15)', color: 'var(--error)' }}>
                            {aiData.riskAnalysis.riskLevel || "At Risk"}
                          </span>
                        </div>

                        <div className="risk-alert-box">
                          <strong>AI SUGGESTION:</strong> {aiData.riskAnalysis.suggestion}
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: '16px 0 0', fontSize: '13px', color: 'var(--outline)' }}>
                        All tasks are on track. No high-risk items identified!
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Bottom Row - Insights */}
            <div className="ai-insights-row">
              <div className="ai-insight-card performance">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                  <FiZap size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Urgency Alert</span>
                </div>
                <div style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                  {isLoading ? <Skeleton width="90%" height="14px" borderRadius="4px" style={{ marginTop: '6px' }} /> : (aiData?.insights?.[0] || "No critical alerts.")}
                </div>
              </div>

              <div className="ai-insight-card wellness">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                  <FiCoffee size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Priority Insight</span>
                </div>
                <div style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                  {isLoading ? <Skeleton width="90%" height="14px" borderRadius="4px" style={{ marginTop: '6px' }} /> : (aiData?.insights?.[1] || "Workload optimized.")}
                </div>
              </div>

              <div className="ai-insight-card prediction">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--tertiary)' }}>
                  <FiClock size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Workload Warning</span>
                </div>
                <div style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                  {isLoading ? <Skeleton width="90%" height="14px" borderRadius="4px" style={{ marginTop: '6px' }} /> : (aiData?.insights?.[2] || "Velocity predicting safe status.")}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </div>



      {/* AI Config Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="ai-settings-drawer-overlay" onClick={handleCloseDrawer}>
            <motion.div
              className="ai-settings-drawer"
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div className="ai-chat-drawer-header" style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={flowsyncIcon} alt="FlowSync" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>AI Configuration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSavedModels(!showSavedModels)}
                    style={{
                      background: showSavedModels ? 'rgba(91,140,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: showSavedModels ? 'var(--primary)' : 'var(--on-surface-variant)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FiBookOpen size={14} /> Saved Models
                  </button>
                  <button className="icon-btn" onClick={handleCloseDrawer}>
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div ref={configScrollRef} className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {showSavedModels && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saved Models</h4>
                    {savedModels.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--outline)', textAlign: 'center' }}>No saved models found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedModels.map((modelItem, idx) => {
                          const isConnected = modelItem.status === "Connected";
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setApiSettings({ ...apiSettings, model: modelItem.model, provider: modelItem.provider });
                                setShowSavedModels(false);
                                setToastMsg(`Auto-filled model: ${modelItem.model}`);
                                setToastType("success");
                              }}
                              style={{
                                background: isConnected ? 'rgba(91, 140, 255, 0.15)' : 'rgba(255,255,255,0.01)',
                                border: '1px solid ' + (isConnected ? 'rgba(91, 140, 255, 0.4)' : 'rgba(255,255,255,0.04)'),
                                borderRadius: '8px',
                                padding: '10px 14px',
                                width: '100%',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'var(--on-surface)',
                                fontSize: '13px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div>
                                <strong style={{ display: 'block', fontSize: '13px', color: isConnected ? 'var(--primary)' : 'var(--on-surface)' }}>{modelItem.provider}</strong>
                                <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>{modelItem.model}</span>
                              </div>
                              {isConnected && (
                                <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 700 }}>Now using model</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>AI Provider</label>
                    <input
                      type="text"
                      value={apiSettings.provider}
                      onChange={(e) => setApiSettings({ ...apiSettings, provider: e.target.value })}
                      placeholder="e.g. NVIDIA, OpenAI, Custom..."
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--on-surface)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>The service provider hosting the model.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>API Key</label>
                      <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Required</span>
                    </div>
                    <input
                      type="password"
                      value={apiSettings.apiKey}
                      onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                      placeholder="Enter your private API key..."
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--on-surface)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Credentials are encrypted and saved locally in your browser.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>API Endpoint Link</label>
                    <input
                      type="text"
                      value={apiSettings.baseUrl}
                      onChange={(e) => setApiSettings({ ...apiSettings, baseUrl: e.target.value })}
                      placeholder="e.g. https://integrate.api.nvidia.com/v1"
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--on-surface)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Base URL for NVIDIA or alternative LLM providers.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>Model Reference Identifier</label>
                    <input
                      type="text"
                      value={apiSettings.model}
                      onChange={(e) => setApiSettings({ ...apiSettings, model: e.target.value })}
                      placeholder="e.g. meta/llama-3.1-70b-instruct"
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--on-surface)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Name of the deep learning model to serve analysis.</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>Temperature ({apiSettings.temperature})</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={apiSettings.temperature}
                        onChange={(e) => setApiSettings({ ...apiSettings, temperature: e.target.value })}
                        style={{ width: '100%', height: '36px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Higher values promote creative outputs.</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>Max Tokens</label>
                      <input
                        type="number"
                        value={apiSettings.maxTokens}
                        onChange={(e) => setApiSettings({ ...apiSettings, maxTokens: e.target.value })}
                        placeholder="e.g. 1024"
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--on-surface)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Max output tokens allowed.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onClick={handleCloseDrawer}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 600 }} >Save Settings</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

export default AIAssist;
