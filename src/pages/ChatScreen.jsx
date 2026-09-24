import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import "../styles/global.css";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiHash,
  FiMessageCircle,
  FiMessageSquare,
  FiMoreVertical,
  FiSend,
  FiPaperclip,
  FiSmile,
  FiUsers,
  FiCheck,
  FiX,
  FiChevronRight,
  FiZap,
  FiShield,
  FiCpu,
  FiPhone,
  FiVideo,
  FiArrowRight
} from "react-icons/fi";
import { getChat, fetchChat as fetchChatApi } from "../api/chatApi";
import { allUser } from "../api/userApi";
import socket from "../socket/socket";
import { ChatDmSkeleton, ChatMessageSkeleton } from "../components/ui/Skeleton";

const messageVariants = {
  hidden: { y: 10, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const INITIAL_CHANNELS = [];

const INITIAL_MESSAGES = {};

function ChatScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputText, setInputText] = useState("");

  // State
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messagesData, setMessagesData] = useState(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddChannelOpen, setAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const [users, setUsers] = useState([]);
  const [activeDMUserId, setActiveDMUserId] = useState(() => {
    return location.state?.userId || location.state?.activeDMUserId || null;
  });
  const [allChats, setAllChats] = useState([]);

  // ── New Conversation picker state ──────────────────────────────
  const [showPicker, setShowPicker]         = useState(false);
  const [pickerSearch, setPickerSearch]     = useState("");
  const [pickerMode, setPickerMode]         = useState("dm"); // "dm" | "group"
  const [groupName, setGroupName]           = useState("");
  const [groupMembers, setGroupMembers]     = useState([]); // array of user ids
  const [groups, setGroups]                 = useState([]); // local group channels
  const [activeGroupId, setActiveGroupId]   = useState(null);
  const [sidebarSearch, setSidebarSearch]   = useState("");
  const pickerRef                           = useRef(null);

  useEffect(() => {
    const targetUserId = location.state?.userId || location.state?.activeDMUserId;
    if (targetUserId) {
      setActiveDMUserId(targetUserId);
      setActiveChannelId(null);
      setActiveGroupId(null);
    }
  }, [location.state]);

  const chatContainerRef = useRef(null);

  const activeChannel = activeChannelId ? channels.find(c => c.id === activeChannelId) : null;
  const activeDMUser  = activeDMUserId  ? users.find(u => (u._id || u.id) === activeDMUserId) : null;
  const currentUser   = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser.id || currentUser._id;
  const otherUsers    = users.filter(u => (u._id || u.id) !== currentUserId);
  const activeGroup   = activeGroupId ? groups.find(g => g.id === activeGroupId) : null;

  const filteredOtherUsers = otherUsers.filter(u =>
    !sidebarSearch || (u.name || u.username || "").toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const filteredChannels = channels.filter(c =>
    !sidebarSearch || (c.name || "").toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const filteredGroups = groups.filter(g =>
    !sidebarSearch || (g.name || "").toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Users already in an active DM in the sidebar (to show as "already added")
  const dmUserIds = new Set(otherUsers.map(u => u._id || u.id)); // all shown already

  // Filtered picker list
  const pickerUsers = otherUsers.filter(u =>
    !pickerSearch || (u.name || u.username || "").toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const getDMMessages = () => {
    const filtered = allChats.filter(chat => {
      const sId = typeof chat.sender === 'object' ? (chat.sender?._id || chat.sender?.id) : chat.sender;
      const rId = typeof chat.receiver === 'object' ? (chat.receiver?._id || chat.receiver?.id) : chat.receiver;
      return (sId === currentUserId && rId === activeDMUserId) ||
        (sId === activeDMUserId && rId === currentUserId);
    });

    return filtered.map(chat => {
      const sId = typeof chat.sender === 'object' ? (chat.sender?._id || chat.sender?.id) : chat.sender;
      const senderUser = users.find(u => (u._id || u.id) === sId);
      const isSelf = sId === currentUserId;
      return {
        id: chat._id,
        sender: isSelf ? "You" : (senderUser?.name || senderUser?.username || "Other"),
        time: formatTime(chat.createdAt),
        avatar: isSelf ? (currentUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || currentUser.username || "You")}`) :
          (senderUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderUser?.name || senderUser?.username || "User")}`),
        content: chat.message,
        self: isSelf
      };
    });
  };

  const currentMessages = activeDMUserId
    ? getDMMessages()
    : activeGroupId
      ? (messagesData[activeGroupId] || [])
      : (messagesData[activeChannelId] || []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  useEffect(() => {
    let isMounted = true;
    const initChat = async () => {
      setIsLoading(true);
      try {
        await Promise.allSettled([
          (async () => {
            try {
              const response = await allUser();
              if (response && response.status === 200 && isMounted) {
                setUsers(response.data.users || []);
              }
            } catch (error) {
              console.error("Error fetching users:", error);
            }
          })(),
          (async () => {
            try {
              const response = await getChat();
              if (response && response.status === 200 && isMounted) {
                setAllChats(response.data.data || []);
              }
            } catch (error) {
              console.error("Error fetching chats:", error);
            }
          })()
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initChat();
    return () => { isMounted = false; };
  }, []);

  const sendMessage = async (data) => {
    try {
      socket.emit("sendMessage", {
        sender: currentUserId,
        receiver: data.receiver,
        message: data.message
      });

      const newChatObj = {
        _id: `temp-${Date.now()}`,
        sender: currentUserId,
        receiver: data.receiver,
        message: data.message,
        createdAt: new Date().toISOString()
      };
      setAllChats((prev) => [...prev, newChatObj]);
    } catch (error) {
      console.error("Error sending chat via socket:", error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    // Guard: nothing selected
    if (!activeDMUserId && !activeChannelId) return;
    // Guard: block self-message
    if (activeDMUserId && activeDMUserId === currentUserId) return;

    if (activeDMUserId) {
      const payload = {
        receiver: activeDMUserId,
        message: inputText
      };
      sendMessage(payload);
    } else {
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: currentUser.name || currentUser.username || "You",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || currentUser.username || "You")}`,
        content: inputText,
        self: true
      };

      const targetId = activeGroupId || activeChannelId;
      if (targetId) {
        setMessagesData({
          ...messagesData,
          [targetId]: [...currentMessages, newMsg]
        });
      }
    }
    setInputText("");
  };

  const handleAddChannel = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const formattedName = newChannelName.toLowerCase().replace(/\s+/g, '-');
    const newChan = { id: `c-${Date.now()}`, name: formattedName, badge: 0 };

    setChannels([...channels, newChan]);
    setActiveChannelId(newChan.id);
    setActiveDMUserId(null);
    setAddChannelOpen(false);
    setNewChannelName("");
    setToastMsg(`Channel #${formattedName} created!`);
    setToastType("success");
  };

  const selectChannel = (id) => {
    setActiveChannelId(id);
    setActiveDMUserId(null);
    setActiveGroupId(null);
    setChannels(channels.map(c => c.id === id ? { ...c, badge: 0 } : c));
  };

  const selectDMUser = (id) => {
    setActiveDMUserId(id);
    setActiveChannelId(null);
    setActiveGroupId(null);
    setShowPicker(false);
  };

  const selectGroup = (id) => {
    setActiveGroupId(id);
    setActiveDMUserId(null);
    setActiveChannelId(null);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const toggleGroupMember = (id) => {
    setGroupMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const createGroup = () => {
    if (!groupName.trim() || groupMembers.length === 0) return;
    const memberObjs = groupMembers.map(id => users.find(u => (u._id || u.id) === id)).filter(Boolean);
    const newGroup = {
      id: `g-${Date.now()}`,
      name: groupName.trim(),
      members: memberObjs,
      messages: []
    };
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    setActiveDMUserId(null);
    setActiveChannelId(null);
    setShowPicker(false);
    setGroupName("");
    setGroupMembers([]);
    setPickerMode("dm");
    setToastMsg(`Group "${newGroup.name}" created!`);
    setToastType("success");
  };

  const fetchChat = async (reciver) => {
    try {
      const response = await fetchChatApi({ receiver: reciver });
      if (response && response.status === 200 && response.data?.success) {
        const chats = response.data.data || [];
        setAllChats(prev => {
          const currentUser = JSON.parse(localStorage.getItem("user")) || {};
          const currentUserId = currentUser.id || currentUser._id;
          const otherChats = prev.filter(chat => {
            const sId = typeof chat.sender === 'object' ? (chat.sender?._id || chat.sender?.id) : chat.sender;
            const rId = typeof chat.receiver === 'object' ? (chat.receiver?._id || chat.receiver?.id) : chat.receiver;
            const isMatch = (sId === currentUserId && rId === reciver) ||
              (sId === reciver && rId === currentUserId);
            return !isMatch;
          });
          return [...otherChats, ...chats];
        });
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    if (activeDMUserId) {
      fetchChat(activeDMUserId);
    }
  }, [activeDMUserId]);

  useEffect(() => {
    socket.on("receiveMessage", (chat) => {
      console.log(chat);
      setAllChats((prev) => [...prev, chat]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        <header className="top-header" style={{ flexShrink: 0 }}>
          <div className="header-search">
            <FiMessageSquare size={18} color="var(--on-surface-variant)" />
            <span style={{ fontSize: "15px", color: "var(--on-surface-variant)", paddingLeft: "8px" }}>
              Team Chat &amp; Messages
            </span>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => { setToastMsg("No new notifications"); setToastType("info"); }}><FiBell size={20} /></button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '20px', gap: '20px' }}>

          {/* Left Column: Channels & DMs */}
          <div className="glass-card" style={{ width: '290px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px 0' }}>
            <div style={{ padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>Messages</h3>
                <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                  {otherUsers.length} teammates • {channels.length + groups.length} channels
                </span>
              </div>

              {/* ── + Button + Picker Panel ── */}
              <div style={{ position: 'relative' }} ref={pickerRef}>
                <button
                  className="icon-btn"
                  style={{
                    padding: '6px',
                    background: showPicker ? 'rgba(91,140,255,0.2)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    color: showPicker ? 'var(--primary)' : 'var(--on-surface)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                  onClick={() => { setShowPicker(p => !p); setPickerSearch(""); setPickerMode("dm"); setGroupName(""); setGroupMembers([]); }}
                  title="New conversation"
                >
                  <FiPlus size={16} />
                </button>

                <AnimatePresence>
                  {showPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        position: 'absolute', top: '36px', right: 0,
                        width: '260px',
                        background: 'var(--surface-container)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: '14px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                        zIndex: 200,
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column'
                      }}
                    >
                      {/* Header tabs */}
                      <div style={{ display: 'flex', borderBottom: '1px solid var(--outline-variant)' }}>
                        <button
                          onClick={() => { setPickerMode("dm"); setGroupMembers([]); setGroupName(""); }}
                          style={{
                            flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600,
                            background: pickerMode === "dm" ? 'rgba(91,140,255,0.1)' : 'transparent',
                            color: pickerMode === "dm" ? 'var(--primary)' : 'var(--on-surface-variant)',
                            border: 'none', cursor: 'pointer',
                            borderBottom: pickerMode === "dm" ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.15s'
                          }}
                        >
                          Direct Message
                        </button>
                        <button
                          onClick={() => setPickerMode("group")}
                          style={{
                            flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600,
                            background: pickerMode === "group" ? 'rgba(65,238,130,0.08)' : 'transparent',
                            color: pickerMode === "group" ? 'var(--secondary)' : 'var(--on-surface-variant)',
                            border: 'none', cursor: 'pointer',
                            borderBottom: pickerMode === "group" ? '2px solid var(--secondary)' : '2px solid transparent',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <FiUsers size={13} /> Group
                        </button>
                      </div>

                      {/* Group name input (only in group mode) */}
                      {pickerMode === "group" && (
                        <div style={{ padding: '10px 12px 0' }}>
                          <input
                            type="text"
                            placeholder="Group name…"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            style={{
                              width: '100%', padding: '7px 12px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--outline-variant)',
                              borderRadius: '8px',
                              color: 'var(--on-surface)', fontSize: '13px',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Search box */}
                      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <FiSearch size={14} color="var(--on-surface-variant)" />
                        <input
                          type="text"
                          placeholder="Search members…"
                          value={pickerSearch}
                          onChange={e => setPickerSearch(e.target.value)}
                          autoFocus
                          style={{
                            flex: 1, background: 'transparent', border: 'none',
                            color: 'var(--on-surface)', fontSize: '13px', outline: 'none'
                          }}
                        />
                        {pickerSearch && (
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: 0 }} onClick={() => setPickerSearch("")}>
                            <FiX size={13} />
                          </button>
                        )}
                      </div>

                      {/* Member list */}
                      <div className="custom-scrollbar" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {pickerUsers.length === 0 ? (
                          <p style={{ margin: 0, padding: '16px', fontSize: '13px', color: 'var(--outline)', textAlign: 'center' }}>No members found</p>
                        ) : (
                          pickerUsers.map(u => {
                            const uid = u._id || u.id;
                            const isSelected = groupMembers.includes(uid);
                            return (
                              <button
                                key={uid}
                                onClick={() => {
                                  if (pickerMode === "dm") {
                                    selectDMUser(uid);
                                  } else {
                                    toggleGroupMember(uid);
                                  }
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  width: '100%', padding: '9px 12px',
                                  background: isSelected ? 'rgba(65,238,130,0.08)' : 'transparent',
                                  border: 'none', cursor: 'pointer',
                                  color: 'var(--on-surface)', textAlign: 'left',
                                  transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                              >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                  <img
                                    src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.username || 'U')}`}
                                    alt={u.name}
                                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', border: '2px solid var(--surface-container)' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name || u.username}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{u.role || 'Member'}</div>
                                </div>
                                {pickerMode === "group" && (
                                  <div style={{
                                    width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                                    border: `2px solid ${isSelected ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                                    background: isSelected ? 'rgba(65,238,130,0.2)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s'
                                  }}>
                                    {isSelected && <FiCheck size={11} color="var(--secondary)" />}
                                  </div>
                                )}
                                {pickerMode === "dm" && (
                                  <FiChevronRight size={14} color="var(--outline)" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Group create button */}
                      {pickerMode === "group" && (
                        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--outline-variant)' }}>
                          <button
                            onClick={createGroup}
                            disabled={!groupName.trim() || groupMembers.length === 0}
                            style={{
                              width: '100%', padding: '8px',
                              background: (!groupName.trim() || groupMembers.length === 0) ? 'rgba(65,238,130,0.06)' : 'rgba(65,238,130,0.15)',
                              border: '1px solid rgba(65,238,130,0.3)',
                              borderRadius: '9px', cursor: (!groupName.trim() || groupMembers.length === 0) ? 'not-allowed' : 'pointer',
                              color: 'var(--secondary)', fontSize: '13px', fontWeight: 600,
                              opacity: (!groupName.trim() || groupMembers.length === 0) ? 0.5 : 1,
                              transition: 'all 0.15s'
                            }}
                          >
                            {groupMembers.length === 0
                              ? 'Select members to create group'
                              : `Create group with ${groupMembers.length} member${groupMembers.length > 1 ? 's' : ''}`}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Search filter in left panel */}
            <div style={{ padding: '0 14px 12px 14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0 10px',
                transition: 'border-color 0.2s'
              }}>
                <FiSearch size={14} color="var(--outline)" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--on-surface)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch("")}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--outline)', display: 'flex' }}
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Channels section */}
              {filteredChannels.length > 0 && (
                <>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--outline)', margin: '8px 8px 4px', fontWeight: 600 }}>
                    Channels
                  </h4>
                  {filteredChannels.map(channel => {
                    const isActive = channel.id === activeChannelId;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => selectChannel(channel.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px', borderRadius: '10px',
                          background: isActive ? 'rgba(91, 140, 255, 0.15)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                          color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                          transition: 'all 0.15s', textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>
                          <FiHash size={15} />{channel.name}
                        </div>
                        {channel.badge > 0 && (
                          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{channel.badge}</span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Groups section */}
              {filteredGroups.length > 0 && (
                <>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--outline)', margin: '14px 8px 4px', fontWeight: 600 }}>
                    Groups
                  </h4>
                  {filteredGroups.map(grp => {
                    const isActive = grp.id === activeGroupId;
                    return (
                      <button
                        key={grp.id}
                        onClick={() => selectGroup(grp.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', borderRadius: '10px',
                          background: isActive ? 'rgba(65, 238, 130, 0.12)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          borderLeft: isActive ? '3px solid var(--secondary)' : '3px solid transparent',
                          color: isActive ? 'var(--secondary)' : 'var(--on-surface-variant)',
                          width: '100%', textAlign: 'left', transition: 'all 0.15s'
                        }}
                      >
                        {/* Stacked member avatars */}
                        <div style={{ display: 'flex', flexShrink: 0 }}>
                          {grp.members.slice(0, 3).map((m, i) => (
                            <img
                              key={m._id || m.id}
                              src={m.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || m.username || 'U')}`}
                              alt={m.name}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--surface-card, #131b2e)', marginLeft: i === 0 ? 0 : '-7px', objectFit: 'cover' }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{grp.name}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Direct Messages section */}
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--outline)', margin: '14px 8px 6px', fontWeight: 600 }}>
                Direct Messages
              </h4>

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[1, 2, 3, 4].map(idx => (
                    <ChatDmSkeleton key={idx} />
                  ))}
                </div>
              ) : filteredOtherUsers.length === 0 ? (
                <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--outline)', fontSize: '13px' }}>
                  No chats match "{sidebarSearch}"
                </div>
              ) : (
                filteredOtherUsers.map(user => {
                  const userId = user._id || user.id;
                  const isActive = userId === activeDMUserId;
                  return (
                    <button
                      key={userId}
                      onClick={() => selectDMUser(userId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(91, 140, 255, 0.15)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.username || "User")}`}
                          alt={user.username}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '8px',
                          height: '8px',
                          background: 'var(--secondary)',
                          borderRadius: '50%',
                          border: '2px solid var(--surface-card, #131b2e)',
                          boxShadow: '0 0 6px rgba(65, 238, 130, 0.6)'
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--primary)' : 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name || user.username}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.role || 'Member'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ── No conversation selected: luxury workspace hero state ── */}
            {!activeDMUserId && !activeChannelId && !activeGroupId ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                textAlign: 'center',
                position: 'relative',
                overflowY: 'auto'
              }}>
                {/* Large Ambient Radial Glows */}
                <div
                  style={{
                    position: 'absolute',
                    top: '25%',
                    width: '420px',
                    height: '420px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(91, 140, 255, 0.18) 0%, rgba(65, 238, 130, 0.06) 45%, transparent 70%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '26px' }}>
                  
                  {/* 3D Floating Hero Emblem */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <div style={{
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: '30px',
                      background: 'radial-gradient(circle, rgba(91, 140, 255, 0.25) 0%, transparent 70%)',
                      filter: 'blur(12px)'
                    }} />

                    {/* Floating Glass Icon Card */}
                    <div style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(91, 140, 255, 0.15) 100%)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <FiMessageSquare size={36} color="#5b8cff" style={{ filter: 'drop-shadow(0 4px 12px rgba(91,140,255,0.6))' }} />

                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #41ee82, #00c853)',
                        border: '2px solid var(--surface-card, #131b2e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(65, 238, 130, 0.4)'
                      }}>
                        <FiZap size={13} color="#0b0f19" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Hero Header & Subtitle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 14px',
                      borderRadius: '9999px',
                      background: 'rgba(91, 140, 255, 0.12)',
                      border: '1px solid rgba(91, 140, 255, 0.25)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: 'var(--primary)',
                      textTransform: 'uppercase'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
                      FlowSync Real-Time Messaging
                    </div>

                    <h2 style={{
                      margin: 0,
                      fontSize: '27px',
                      fontWeight: 700,
                      letterSpacing: '-0.3px',
                      background: 'linear-gradient(135deg, #ffffff 40%, #a8c7fa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.25
                    }}>
                      Connect &amp; Collaborate in Real Time
                    </h2>

                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: 'var(--on-surface-variant)',
                      maxWidth: '480px',
                      lineHeight: 1.6
                    }}>
                      Send instant direct messages, sync up across team channels, or ask Echo AI for drafting and brainstorming support.
                    </p>
                  </div>

                  {/* Quick-Action Launchers Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: otherUsers.length > 0 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr 1fr',
                    gap: '12px',
                    width: '100%',
                    marginTop: '4px'
                  }}>
                    {/* Teammates Quick Cards */}
                    {otherUsers.slice(0, 3).map(u => {
                      const uId = u._id || u.id;
                      return (
                        <motion.button
                          key={uId}
                          whileHover={{ y: -3, scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectDMUser(uId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--on-surface)',
                            transition: 'border-color 0.2s, background 0.2s',
                            backdropFilter: 'blur(10px)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(91, 140, 255, 0.35)';
                            e.currentTarget.style.background = 'rgba(91, 140, 255, 0.08)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          }}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img
                              src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.username || 'User')}`}
                              alt={u.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)' }}
                            />
                            <span style={{
                              position: 'absolute',
                              bottom: -1,
                              right: -1,
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--secondary)',
                              border: '2px solid var(--surface-card, #131b2e)',
                              boxShadow: '0 0 6px rgba(65, 238, 130, 0.8)'
                            }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {u.name || u.username}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                              {u.role || 'Member'} • <span style={{ color: 'var(--secondary)' }}>Online</span>
                            </div>
                          </div>
                          <FiArrowRight size={14} color="var(--outline)" />
                        </motion.button>
                      );
                    })}

                    {/* Action: Create Group Channel */}
                    <motion.button
                      whileHover={{ y: -3, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowPicker(true);
                        setPickerMode("group");
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: 'rgba(65, 238, 130, 0.04)',
                        border: '1px solid rgba(65, 238, 130, 0.15)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--on-surface)',
                        backdropFilter: 'blur(10px)',
                        transition: 'border-color 0.2s, background 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(65, 238, 130, 0.4)';
                        e.currentTarget.style.background = 'rgba(65, 238, 130, 0.09)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(65, 238, 130, 0.15)';
                        e.currentTarget.style.background = 'rgba(65, 238, 130, 0.04)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(65, 238, 130, 0.15)',
                        color: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FiUsers size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)' }}>New Group Chat</div>
                        <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>Create channel</div>
                      </div>
                      <FiPlus size={15} color="var(--secondary)" />
                    </motion.button>

                    {/* Action: Echo AI shortcut */}
                    <motion.button
                      whileHover={{ y: -3, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/ai-assist")}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: 'rgba(168, 85, 247, 0.04)',
                        border: '1px solid rgba(168, 85, 247, 0.18)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--on-surface)',
                        backdropFilter: 'blur(10px)',
                        transition: 'border-color 0.2s, background 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.18)';
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.04)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FiCpu size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)' }}>Echo AI</div>
                        <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>AI workspace chat</div>
                      </div>
                      <FiArrowRight size={14} color="#c084fc" />
                    </motion.button>
                  </div>

                  {/* Feature trust pills at bottom */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    marginTop: '8px',
                    paddingTop: '18px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)' }} />
                      <span>Live WebSocket Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                      <FiShield size={13} color="var(--primary)" />
                      <span>End-to-End Encrypted</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                      <FiPaperclip size={13} color="var(--tertiary)" />
                      <span>Fast Attachment Sharing</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
            {/* Active Conversation Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(16px)'
            }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {activeDMUserId ? (
                    <>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={activeDMUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeDMUser?.name || activeDMUser?.username || "User")}`}
                          alt={activeDMUser?.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '9px',
                          height: '9px',
                          background: 'var(--secondary)',
                          borderRadius: '50%',
                          border: '2px solid var(--surface-card, #131b2e)',
                          boxShadow: '0 0 6px rgba(65, 238, 130, 0.8)'
                        }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>{activeDMUser?.name || activeDMUser?.username}</div>
                        <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
                          Active Now • {activeDMUser?.role || 'Member'}
                        </div>
                      </div>
                    </>
                  ) : activeGroupId ? (
                    <>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(65, 238, 130, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiUsers size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>{activeGroup?.name || "Group Chat"}</div>
                        <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--on-surface-variant)' }}>
                          {activeGroup?.members?.length || 0} members
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(91, 140, 255, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiHash size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>{activeChannel?.name || "Channel"}</div>
                        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Company communications</div>
                      </div>
                    </>
                  )}
                </h3>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="icon-btn"
                  title="Voice Call"
                  onClick={() => { setToastMsg("Voice call feature is coming soon!"); setToastType("info"); }}
                  style={{ borderRadius: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <FiPhone size={17} />
                </button>
                <button
                  className="icon-btn"
                  title="Video Call"
                  onClick={() => { setToastMsg("Video call feature is coming soon!"); setToastType("info"); }}
                  style={{ borderRadius: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <FiVideo size={17} />
                </button>
                <button
                  className="icon-btn"
                  title="Chat Settings"
                  onClick={() => { setToastMsg("Chat options"); setToastType("info"); }}
                  style={{ borderRadius: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <FiMoreVertical size={17} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div ref={chatContainerRef} className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ChatMessageSkeleton isSelf={false} />
                  <ChatMessageSkeleton isSelf={true} />
                  <ChatMessageSkeleton isSelf={false} />
                  <ChatMessageSkeleton isSelf={true} />
                </div>
              ) : currentMessages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '16px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(91, 140, 255, 0.1)',
                    border: '1px solid rgba(91, 140, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FiMessageCircle size={32} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>
                      {activeDMUserId
                        ? `Chat with ${activeDMUser?.name || activeDMUser?.username || 'teammate'}`
                        : `Welcome to #${activeChannel?.name || activeGroup?.name || 'channel'}`}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--on-surface-variant)', maxWidth: '380px', lineHeight: 1.5 }}>
                      {activeDMUserId
                        ? `This is the direct conversation between you and ${activeDMUser?.name || 'your colleague'}. Send a message or start a discussion.`
                        : `This is the start of the #${activeChannel?.name || activeGroup?.name} channel. Messages sent here are visible to all members.`}
                    </p>
                  </div>

                  {/* Quick ice-breaker prompt chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                    {[
                      "👋 Say Hello",
                      "📅 Sync on Tasks",
                      "🚀 Review Progress"
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setInputText(chip.replace(/^[^\w]+/, '').trim() + "! ")}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--on-surface)',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91, 140, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(91, 140, 255, 0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {currentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignSelf: msg.self ? 'flex-end' : 'flex-start',
                        flexDirection: msg.self ? 'row-reverse' : 'row',
                        maxWidth: '75%'
                      }}
                    >
                      {!msg.self && (
                        <img
                          src={msg.avatar}
                          alt={msg.sender}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        />
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.self ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px', flexDirection: msg.self ? 'row-reverse' : 'row' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--on-surface)' }}>{msg.self ? 'You' : msg.sender}</span>
                          <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            {msg.time}
                            {msg.self && <FiCheck size={12} color="var(--secondary)" />}
                          </span>
                        </div>

                        <div style={{
                          background: msg.self
                            ? 'linear-gradient(135deg, #5b8cff 0%, #3d6ae8 100%)'
                            : 'var(--surface-high)',
                          padding: '12px 18px',
                          borderRadius: '18px',
                          borderBottomRightRadius: msg.self ? '4px' : '18px',
                          borderBottomLeftRadius: !msg.self ? '4px' : '18px',
                          color: msg.self ? '#ffffff' : 'var(--on-surface)',
                          fontSize: '14.5px',
                          lineHeight: 1.55,
                          boxShadow: msg.self ? '0 4px 16px rgba(91, 140, 255, 0.3)' : '0 4px 14px rgba(0, 0, 0, 0.15)',
                          border: msg.self ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Modern Glass Capsule Input Bar */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 14px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ marginRight: '6px', padding: '6px', color: 'var(--outline)' }}
                    onClick={() => { setToastMsg("Attachment dialog opened"); setToastType("info"); }}
                    title="Attach file"
                  >
                    <FiPaperclip size={18} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeDMUserId
                        ? `Message ${activeDMUser?.name || activeDMUser?.username || 'teammate'}…`
                        : `Message #${activeChannel?.name || activeGroup?.name || 'channel'}…`
                    }
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--on-surface)',
                      fontSize: '14px',
                      padding: '10px 4px',
                      outline: 'none'
                    }}
                  />

                  <button
                    type="button"
                    className="icon-btn"
                    style={{ marginLeft: '6px', padding: '6px', color: 'var(--outline)' }}
                    onClick={() => { setToastMsg("Emoji picker opened"); setToastType("info"); }}
                    title="Insert emoji"
                  >
                    <FiSmile size={18} />
                  </button>
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    height: '44px',
                    width: '44px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    flexShrink: 0,
                    cursor: !inputText.trim() ? 'not-allowed' : 'pointer',
                    opacity: !inputText.trim() ? 0.45 : 1,
                    boxShadow: !inputText.trim() ? 'none' : '0 4px 16px rgba(91, 140, 255, 0.4)'
                  }}
                  disabled={!inputText.trim()}
                >
                  <FiSend size={18} style={{ marginLeft: '-1px' }} />
                </motion.button>
              </form>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Add Channel Modal */}
      <Modal isOpen={isAddChannelOpen} onClose={() => setAddChannelOpen(false)} title="Create a Channel">
        <form onSubmit={handleAddChannel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)' }}>Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiHash size={16} color="var(--outline)" style={{ position: 'absolute', left: '16px' }} />
              <input
                type="text"
                required
                placeholder="e.g. bug-reports"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '12px 16px 12px 40px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '8px', color: 'var(--on-surface)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setAddChannelOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}

export default ChatScreen;
