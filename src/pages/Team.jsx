import React from "react";
import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";
import "../styles/team.css";

function Team() {
  const teamMembers = [
    {
      id: "mem-1",
      name: "Alex Rivera",
      role: "Senior Product Designer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      status: "online",
      changeLabel: "Weekly Velocity",
      changeVal: "+12%",
      sparkline: "M0,30 Q20,10 40,25 T80,15 T120,35 T160,5 T200,20"
    },
    {
      id: "mem-2",
      name: "Sarah Chen",
      role: "Lead Frontend Engineer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
      status: "online",
      changeLabel: "Code Output",
      changeVal: "+8%",
      sparkline: "M0,20 Q20,35 40,15 T80,5 T120,25 T160,10 T200,5"
    },
    {
      id: "mem-3",
      name: "Marcus Thorne",
      role: "Backend Architect",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
      status: "away",
      changeLabel: "Uptime Contribution",
      changeVal: "Stable",
      sparkline: "M0,35 Q20,35 40,25 T80,30 T120,20 T160,15 T200,10"
    }
  ];

  return (
    <div className="app-layout">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Body */}
      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search team members..." />
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Quick Actions</button>
            <button className="btn-primary">Create</button>
            <div className="header-divider"></div>
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">group</span>
            </button>
          </div>
        </header>

        <div className="team-container custom-scrollbar">
          {/* Header Block */}
          <div className="team-header">
            <div>
              <h2 className="team-title">Core Team</h2>
              <p className="team-subtitle">Manage your workspace collaborators and their permissions.</p>
            </div>
            <div className="team-action-bar">
              <button className="filter-btn">
                <span className="material-symbols-outlined">filter_list</span>
                <span>Filter</span>
              </button>
              <button className="btn-primary flex-center gap-sm">
                <span className="material-symbols-outlined font-md">person_add</span>
                <span>Invite Member</span>
              </button>
            </div>
          </div>

          {/* Bento grid of collaborators */}
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card glass-card">
                <div className="team-card-header">
                  <div className="avatar-wrapper">
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                    <span className={`status-dot ${member.status}`}></span>
                  </div>
                  <button className="icon-btn"><span className="material-symbols-outlined">more_horiz</span></button>
                </div>
                
                <div className="member-details">
                  <h4 className="member-name">{member.name}</h4>
                  <span className="member-role">{member.role}</span>
                </div>

                {/* SVG sparkline chart */}
                <div className="sparkline-container">
                  <svg className="sparkline-chart" viewBox="0 0 200 40">
                    <defs>
                      <linearGradient id={`grad-${member.id}`} x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#5B8CFF", stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: "#5B8CFF", stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    <path className="sparkline-path" d={member.sparkline}></path>
                    <path className="sparkline-fill" d={`${member.sparkline} V40 H0 Z`} fill={`url(#grad-${member.id})`}></path>
                  </svg>
                </div>

                <div className="team-card-footer">
                  <span className="footer-label">{member.changeLabel}</span>
                  <span className={`footer-val ${member.changeVal.includes("+") ? "text-secondary" : ""}`}>{member.changeVal}</span>
                </div>
              </div>
            ))}

            {/* Invite card */}
            <div className="invite-member-card glass-card border-dashed">
              <div className="add-circle-btn">
                <span className="material-symbols-outlined">add</span>
              </div>
              <div className="invite-info">
                <h5 className="invite-title">Add Team Member</h5>
                <p className="invite-desc">Expand your collaboration circle</p>
              </div>
            </div>
          </div>

          {/* Composition Charts */}
          <div className="team-charts-row">
            {/* Composition Card */}
            <div className="composition-card glass-card">
              <h4 className="chart-title">Team Composition</h4>
              <div className="composition-bars">
                {/* Bar 1 */}
                <div className="comp-bar-item">
                  <div className="comp-bar-meta">
                    <span className="comp-label">Designers</span>
                    <span className="comp-percentage">45%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-primary shadow-glow-primary" style={{ width: "45%" }}></div>
                  </div>
                </div>
                {/* Bar 2 */}
                <div className="comp-bar-item">
                  <div className="comp-bar-meta">
                    <span className="comp-label">Engineers</span>
                    <span className="comp-percentage">40%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-secondary shadow-glow-secondary" style={{ width: "40%" }}></div>
                  </div>
                </div>
                {/* Bar 3 */}
                <div className="comp-bar-item">
                  <div className="comp-bar-meta">
                    <span className="comp-label">Managers</span>
                    <span className="comp-percentage">15%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-tertiary shadow-glow-tertiary" style={{ width: "15%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulse Rating Card */}
            <div className="pulse-rating-card glass-card">
              <div className="pulse-meta-block">
                <h4 className="chart-title">Pulse Rating</h4>
                <div className="pulse-number-display">
                  98.4<span className="percent-sign">%</span>
                </div>
                <p className="pulse-desc-text">Collaboration health is at its peak this month.</p>
              </div>
              
              <div className="pulse-circle-widget">
                <svg className="circular-widget-svg" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" className="circle-bg" />
                  <circle cx="64" cy="64" r="56" className="circle-fill" />
                </svg>
                <span className="material-symbols-outlined bolt-icon animate-glow">bolt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Team Pulse */}
      <aside className="dashboard-sidebar custom-scrollbar">
        <div className="pulse-header">
          <span className="pulse-tag">Team Pulse</span>
          <h3 className="pulse-title">Live Updates</h3>
        </div>

        <div className="activity-timeline-container flex-1">
          <div className="timeline-activity">
            <div className="timeline-item">
              <div className="timeline-icon bg-surface-high text-primary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Sarah Chen</strong> pushed 12 commits to <span className="text-primary">flow-sync-core</span></p>
                <span className="activity-time">2 mins ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-secondary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Alex Rivera</strong> completed 4 tasks in <span className="text-secondary">Sprint Beta</span></p>
                <span className="activity-time">15 mins ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-surface-high text-tertiary">
                <span className="material-symbols-outlined">comment</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Marcus Thorne</strong> replied to your comment</p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
          </div>

          <div className="upcoming-events-block">
            <h5 className="section-sub-title mb-md">Upcoming</h5>
            <div className="glass-card p-md rounded-xl event-highlight-card">
              <div className="event-info-row">
                <span className="material-symbols-outlined text-primary">event_upcoming</span>
                <span className="highlight-event-title">Design Review</span>
              </div>
              <p className="highlight-event-time">Today, 4:00 PM</p>
            </div>
          </div>
        </div>

        <div className="team-huddle-box glass-card bg-glow-blue">
          <div className="huddle-header">
            <div className="avatar-wrapper-mini">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Sync Avatar" className="mini-sync-avatar" />
            </div>
            <span className="huddle-title">Team Sync Active</span>
          </div>
          <button className="join-huddle-btn">Join Huddle</button>
        </div>
      </aside>
    </div>
  );
}

export default Team;
