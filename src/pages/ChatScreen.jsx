import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";
import "../styles/chatscreen.css";

function ChatScreen() {
  const [inputText, setInputText] = useState("");

  const channelsList = [
    { name: "general", active: false },
    { name: "design-sync", active: true, unread: false, isPrimary: true },
    { name: "engineering", active: false },
    { name: "marketing", active: false, badge: 12 }
  ];

  const messages = [
    {
      id: "msg-1",
      sender: "Marcus Chen",
      time: "10:42 AM",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80",
      content: "Hey team! I've uploaded the latest high-fidelity wireframes for the user dashboard. Let me know what you think about the new glassmorphic widgets.",
      reactions: [
        { emoji: "🔥", count: 4, active: true },
        { emoji: "🚀", count: 2 }
      ],
      self: false
    },
    {
      id: "msg-2",
      sender: "Alex Rivera",
      time: "10:45 AM",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80",
      content: "Checking them out now. The luminescent borders look incredible. It really helps with the depth hierarchy!",
      self: true
    },
    {
      id: "msg-3",
      sender: "Sarah Jenkins",
      time: "11:02 AM",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80",
      content: "I've added some comments in Figma regarding the mobile responsiveness of the grid.",
      file: {
        name: "mobile_grid_specs_v2.pdf",
        size: "2.4 MB",
        type: "PDF"
      },
      repliesCount: 4,
      self: false
    }
  ];

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Chat Layout (contains Channel sidebar, Chat stream, and details right-sidebar) */}
      <div className="chat-layout-wrapper">
        
        {/* Left inner-sidebar: Channels list */}
        <aside className="channels-sidebar">
          <div className="channels-title-block">
            <h3 className="channels-title">Channels</h3>
            <span className="material-symbols-outlined hover-text-primary pointer">add_box</span>
          </div>
          <div className="channels-list">
            {channelsList.map((ch, idx) => (
              <div 
                key={idx} 
                className={`channel-item-row ${ch.active ? "active" : ""}`}
              >
                <div className="channel-name-block">
                  <span className="hash-symbol">#</span>
                  <span className="channel-name-label">{ch.name}</span>
                </div>
                {ch.isPrimary && <span className="channel-pulsing-dot animate-glow"></span>}
                {ch.badge && <span className="channel-badge-val">{ch.badge}</span>}
              </div>
            ))}
          </div>
        </aside>

        {/* Central Chat Shell */}
        <div className="chat-main-shell">
          {/* Header info */}
          <header className="chat-nav-bar">
            <div className="channel-meta-info">
              <h2 className="active-channel-name">
                <span className="hash-symbol">#</span> design-sync
                <span className="material-symbols-outlined favorite-star pointer">star</span>
              </h2>
              <span className="channel-desc-text">Project: Nebula Mobile App Redesign</span>
            </div>
            
            <div className="chat-actions-group">
              <div className="members-stack-mini">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Marcus" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Sarah" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="Elena" />
                <div className="stack-plus-badge">+8</div>
              </div>
              <div className="bar-separator"></div>
              <button className="chat-bar-icon"><span className="material-symbols-outlined">call</span></button>
              <button className="chat-bar-icon"><span className="material-symbols-outlined">videocam</span></button>
              <button className="chat-bar-icon"><span className="material-symbols-outlined">info</span></button>
            </div>
          </header>

          {/* Messages Feed */}
          <div className="messages-stream custom-scrollbar">
            <div className="day-divider-row">
              <div className="line-bar"></div>
              <span className="divider-tag-label">Yesterday</span>
              <div className="line-bar"></div>
            </div>

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`msg-bubble-wrapper ${msg.self ? "self-aligned" : ""}`}
              >
                {!msg.self && (
                  <img src={msg.avatar} alt={msg.sender} className="sender-avatar-round" />
                )}
                
                <div className="msg-body-block">
                  <div className="msg-meta-row">
                    <span className="sender-name-label">{msg.sender}</span>
                    <span className="msg-time-stamp">{msg.time}</span>
                  </div>

                  <div className={`msg-text-bubble ${msg.self ? "self-style" : "other-style"}`}>
                    <p className="msg-text-val">{msg.content}</p>

                    {/* Attachment preview inside card */}
                    {msg.file && (
                      <div className="file-attachment-chip">
                        <div className="file-icon-box">
                          <span className="material-symbols-outlined">description</span>
                        </div>
                        <div className="file-meta">
                          <span className="file-name-txt">{msg.file.name}</span>
                          <span className="file-size-txt">{msg.file.size} • {msg.file.type}</span>
                        </div>
                        <span className="material-symbols-outlined download-arrow-icon pointer">download</span>
                      </div>
                    )}
                  </div>

                  {/* Reaction chips */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="msg-reactions-row">
                      {msg.reactions.map((react, i) => (
                        <button 
                          key={i} 
                          className={`reaction-badge-btn ${react.active ? "active-accent" : ""}`}
                        >
                          <span>{react.emoji}</span>
                          <span>{react.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Thread reply button */}
                  {msg.repliesCount && (
                    <button className="thread-reply-trigger">
                      <div className="thread-users-avatar">M</div>
                      <span>{msg.repliesCount} replies • Last reply 5 min ago</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="day-divider-row">
              <div className="line-bar"></div>
              <span className="divider-tag-label">Today</span>
              <div className="line-bar"></div>
            </div>

            {/* Typing indicator */}
            <div className="typing-state-block">
              <div className="typing-loader">
                <span className="typing-circle"></span>
                <span className="typing-circle"></span>
                <span className="typing-circle"></span>
              </div>
              <p className="typing-status-txt"><strong>Jordan</strong> is typing...</p>
            </div>
          </div>

          {/* Chat text editor bottom */}
          <footer className="chat-footer-composer">
            <div className="chat-composer-box glass-card">
              <div className="composer-input-row">
                <button className="composer-icon-btn"><span className="material-symbols-outlined">add_circle</span></button>
                <textarea 
                  className="composer-textarea custom-scrollbar" 
                  placeholder="Message #design-sync..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows="1"
                ></textarea>
                <div className="composer-action-controls">
                  <button className="composer-icon-btn"><span className="material-symbols-outlined">mood</span></button>
                  <button className="composer-icon-btn"><span className="material-symbols-outlined">alternate_email</span></button>
                  <div className="actions-vertical-line"></div>
                  <button className="composer-send-btn glow-primary">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>

              <div className="composer-helper-row">
                <div className="composer-ai-status animate-glow">
                  <span className="material-symbols-outlined bolt-icon-small">bolt</span>
                  <span>AI Summary enabled</span>
                </div>
                <div className="composer-media-options">
                  <span className="material-symbols-outlined pointer hover-text-primary">mic</span>
                  <span className="material-symbols-outlined pointer hover-text-primary">video_call</span>
                  <span className="material-symbols-outlined pointer hover-text-primary">screen_share</span>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Right Detail Pane */}
        <aside className="chat-details-panel">
          <div className="details-header-row">
            <h3 className="panel-title">Channel Details</h3>
            <button className="icon-btn"><span className="material-symbols-outlined">close</span></button>
          </div>

          <div className="channel-display-banner">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" alt="Channel Cover" className="banner-img" />
            <div className="banner-cover-overlay"></div>
            <div className="banner-title-block">
              <div className="banner-symbol-box">D</div>
              <span className="banner-channel-name"># design-sync</span>
            </div>
          </div>

          {/* Section: Pinned messages */}
          <div className="details-panel-section">
            <div className="section-label-header">
              <span className="section-label-title"><span className="material-symbols-outlined font-md">push_pin</span> Pinned Messages</span>
              <span className="pinned-count-badge">3</span>
            </div>
            <div className="pinned-message-card glass-card">
              <p className="pinned-message-txt">"Q3 Design System update is live in Figma. Please review the new token architecture by Friday..."</p>
              <span className="pinned-meta-txt">Pinned by Sarah • Aug 24</span>
            </div>
          </div>

          {/* Section: Shared Files */}
          <div className="details-panel-section">
            <div className="section-label-header">
              <span className="section-label-title"><span className="material-symbols-outlined font-md">folder</span> Shared Files</span>
              <span className="view-all-link pointer hover-text-primary">View all</span>
            </div>
            <div className="shared-files-list">
              {/* File 1 */}
              <div className="shared-file-item">
                <div className="shared-file-icon-wrapper text-blue">
                  <span className="material-symbols-outlined">image</span>
                </div>
                <div className="shared-file-details">
                  <p className="shared-file-name truncate">hero_section_v1.png</p>
                  <p className="shared-file-size">Alex • 2.1 MB</p>
                </div>
              </div>
              {/* File 2 */}
              <div className="shared-file-item">
                <div className="shared-file-icon-wrapper text-secondary">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="shared-file-details">
                  <p className="shared-file-name truncate">product_requirements.pdf</p>
                  <p className="shared-file-size">Marcus • 1.2 MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Members list */}
          <div className="details-panel-section">
            <div className="section-label-header">
              <span className="section-label-title"><span className="material-symbols-outlined font-md">group</span> Members</span>
              <span className="members-online-count">24 Online</span>
            </div>
            <div className="panel-members-list custom-scrollbar">
              <div className="panel-member-item">
                <div className="member-avatar-wrapper">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" alt="Alex" className="member-avatar-mini" />
                  <span className="member-status-dot active"></span>
                </div>
                <span className="member-name-lbl">Alex Rivera (You)</span>
              </div>
              <div className="panel-member-item">
                <div className="member-avatar-wrapper">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Marcus" className="member-avatar-mini" />
                  <span className="member-status-dot active"></span>
                </div>
                <span className="member-name-lbl">Marcus Chen</span>
              </div>
              <div className="panel-member-item">
                <div className="member-avatar-wrapper">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Sarah" className="member-avatar-mini" />
                  <span className="member-status-dot active"></span>
                </div>
                <span className="member-name-lbl">Sarah Jenkins</span>
              </div>
              <div className="panel-member-item">
                <div className="member-avatar-wrapper">
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="Jordan" className="member-avatar-mini opacity-60" />
                  <span className="member-status-dot away"></span>
                </div>
                <span className="member-name-lbl text-outline">Jordan Smith</span>
              </div>
            </div>
          </div>

          <button className="leave-channel-btn">
            <span className="material-symbols-outlined">exit_to_app</span>
            <span>Leave Channel</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

export default ChatScreen;
