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
  FiMoreVertical,
  FiSend,
  FiPaperclip,
  FiSmile
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

  useEffect(() => {
    const targetUserId = location.state?.userId || location.state?.activeDMUserId;
    if (targetUserId) {
      setActiveDMUserId(targetUserId);
      setActiveChannelId(null);
    }
  }, [location.state]);

  const chatContainerRef = useRef(null);

  const activeChannel = activeChannelId ? channels.find(c => c.id === activeChannelId) : null;
  const activeDMUser = activeDMUserId ? users.find(u => (u._id || u.id) === activeDMUserId) : null;
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser.id || currentUser._id;
  const otherUsers = users.filter(u => (u._id || u.id) !== currentUserId);

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

      setMessagesData({
        ...messagesData,
        [activeChannelId]: [...currentMessages, newMsg]
      });
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
    setChannels(channels.map(c => c.id === id ? { ...c, badge: 0 } : c));
  };

  const selectDMUser = (id) => {
    setActiveDMUserId(id);
    setActiveChannelId(null);
  };

  const fetchChat = async (reciver) => {
    try {
      const response = await fetchChatApi({ receiver: reciver });
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@.   ", response.data)
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
            <FiSearch size={18} color="var(--on-surface-variant)" />
            <input type="text" placeholder="Search messages, files..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => { setToastMsg("No new notifications"); setToastType("info"); }}><FiBell size={20} /></button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '20px', gap: '20px' }}>

          {/* Left Column: Channels */}
          <div className="glass-card" style={{ width: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 0' }}>
            <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Channels</h3>
              <button className="icon-btn" style={{ padding: '4px' }} onClick={() => setAddChannelOpen(true)}>
                <FiPlus size={16} />
              </button>
            </div>

            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {channels.map(channel => {
                const isActive = channel.id === activeChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => selectChannel(channel.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(91, 140, 255, 0.1)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: isActive ? 600 : 500 }}>
                      <FiHash size={16} />
                      {channel.name}
                    </div>
                    {channel.badge > 0 && (
                      <span style={{ background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>
                        {channel.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--outline)', margin: '24px 8px 8px 8px', fontWeight: 600 }}>Direct Messages</h4>

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[1, 2, 3, 4].map(idx => (
                    <ChatDmSkeleton key={idx} />
                  ))}
                </div>
              ) : (
                otherUsers.map(user => {
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
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(91, 140, 255, 0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.username || "User")}`}
                          alt={user.username}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', border: '2px solid var(--surface-low)' }}></span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: isActive ? 600 : 500 }}>{user.name || user.username}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(67, 70, 83, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeDMUserId ? (
                    <>
                      <img src={activeDMUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeDMUser?.name || activeDMUser?.username || "User")}`} alt={activeDMUser?.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{activeDMUser?.name || activeDMUser?.username}</span>
                    </>
                  ) : (
                    <>
                      <FiHash size={18} color="var(--outline)" />
                      {activeChannel?.name || "Select a channel"}
                    </>
                  )}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                  {activeDMUserId ? `Direct Message with ${activeDMUser?.username}` : "Company communications"}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex' }}>
                  <img src={currentUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || currentUser?.username || "You")}`} alt="You" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--surface)', marginLeft: '-8px' }} />
                  {activeDMUserId && (
                    <img src={activeDMUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeDMUser?.name || activeDMUser?.username || "User")}`} alt={activeDMUser?.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--surface)', marginLeft: '-8px' }} />
                  )}
                </div>
                <button className="icon-btn" onClick={() => { setToastMsg("Chat settings"); setToastType("info"); }}><FiMoreVertical size={20} /></button>
              </div>
            </div>

            <div ref={chatContainerRef} className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ChatMessageSkeleton isSelf={false} />
                  <ChatMessageSkeleton isSelf={true} />
                  <ChatMessageSkeleton isSelf={false} />
                  <ChatMessageSkeleton isSelf={true} />
                </div>
              ) : currentMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--on-surface-variant)' }}>
                  <FiMessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <p>
                    {activeDMUserId
                      ? `This is the start of your direct message history with ${activeDMUser?.name || activeDMUser?.username || "this user"}.`
                      : `This is the start of the #${activeChannel?.name || "channel"} channel.`}
                  </p>
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
                        gap: '16px',
                        alignSelf: msg.self ? 'flex-end' : 'flex-start',
                        flexDirection: msg.self ? 'row-reverse' : 'row',
                        maxWidth: '75%'
                      }}
                    >
                      {!msg.self && (
                        <img src={msg.avatar} alt={msg.sender} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.self ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px', flexDirection: msg.self ? 'row-reverse' : 'row' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>{msg.self ? 'You' : msg.sender}</span>
                          <span style={{ fontSize: '11px', color: 'var(--outline)' }}>{msg.time}</span>
                        </div>

                        <div style={{
                          background: msg.self ? 'var(--primary)' : 'var(--surface-high)',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          borderBottomRightRadius: msg.self ? '4px' : '16px',
                          borderBottomLeftRadius: !msg.self ? '4px' : '16px',
                          color: msg.self ? '#fff' : 'var(--on-surface)',
                          fontSize: '15px',
                          lineHeight: 1.5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(67, 70, 83, 0.3)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{
                  flex: 1,
                  background: 'var(--surface-high)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  transition: 'border-color 0.2s'
                }}>
                  <button type="button" className="icon-btn" style={{ marginRight: '8px' }} onClick={() => { setToastMsg("Attachment dialog opened"); setToastType("info"); }}><FiPaperclip size={20} /></button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message #${activeChannel?.name || "channel"}...`}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: '15px', padding: '8px 0', outline: 'none' }}
                  />
                  <button type="button" className="icon-btn" style={{ marginLeft: '8px' }} onClick={() => { setToastMsg("Emoji picker opened"); setToastType("info"); }}><FiSmile size={20} /></button>
                </div>
                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileTap={{ scale: 0.95 }}
                  style={{ height: '46px', width: '46px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}
                  disabled={!inputText.trim()}
                >
                  <FiSend size={18} style={{ marginLeft: '-2px', marginTop: '2px' }} />
                </motion.button>
              </form>
            </div>

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
