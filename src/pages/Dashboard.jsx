import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Calendar from "../components/Calender/Calendar";
import "../styles/global.css";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/tasks");
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content body */}
      <div className="main-content">
        {/* Top bar search and actions */}
        <header className="top-header">
          <div className="header-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search tasks, docs, or people..." />
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Quick Actions</button>
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <div className="header-divider"></div>
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">group</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="dashboard-scroll-area custom-scrollbar">
          <div className="dashboard-canvas">
            
            {/* Hero Section */}
            <section className="dashboard-hero">
              <div className="welcome-text">
                <h2 className="welcome-headline">Welcome back, Alex.</h2>
                <p className="welcome-desc">
                  You've completed <span className="highlight-text font-bold">85%</span> of your weekly goals. Your team is waiting for review on 3 pending items.
                </p>
              </div>

              {/* Active Sprint circular card */}
              <div className="active-sprint-card glass-card" onClick={() => navigate("/tasks")}>
                <div className="circular-progress">
                  <svg className="progress-ring" width="48" height="48">
                    <circle className="progress-ring-bg" cx="24" cy="24" r="20" />
                    <circle className="progress-ring-fill" cx="24" cy="24" r="20" />
                  </svg>
                  <span className="progress-val">75%</span>
                </div>
                <div className="sprint-info">
                  <span className="sprint-tag">Active Sprint</span>
                  <h4 className="sprint-name">Nova Design System</h4>
                  <span className="sprint-due">Due in 2 days</span>
                </div>
                <span className="material-symbols-outlined trend-icon">trending_up</span>
              </div>
            </section>

            {/* Stats Grid */}
            <section className="stats-grid">
              {/* Card 1 */}
              <div className="stat-card glass-card">
                <span className="stat-label">Tasks Completed</span>
                <h3 className="stat-value">124</h3>
                <div className="stat-change positive">
                  <span className="material-symbols-outlined font-sm">north_east</span>
                  <span className="change-text">+12.5%</span>
                </div>
                <span className="material-symbols-outlined card-bg-icon">task_alt</span>
              </div>
              {/* Card 2 */}
              <div className="stat-card glass-card">
                <span className="stat-label">Active Projects</span>
                <h3 className="stat-value">12</h3>
                <div className="stat-change info">
                  <span className="change-text">In Progress</span>
                </div>
                <span className="material-symbols-outlined card-bg-icon">folder_open</span>
              </div>
              {/* Card 3 */}
              <div className="stat-card glass-card">
                <span className="stat-label">Team Members</span>
                <h3 className="stat-value">48</h3>
                <div className="team-avatars">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Team 1" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80" alt="Team 2" />
                  <div className="avatar-placeholder">+46</div>
                </div>
                <span className="material-symbols-outlined card-bg-icon">groups</span>
              </div>
              {/* Card 4 */}
              <div className="stat-card glass-card">
                <span className="stat-label">Productivity Score</span>
                <h3 className="stat-value text-secondary">94%</h3>
                <div className="productivity-progress">
                  <div className="productivity-bar" style={{ width: "94%" }}></div>
                </div>
                <span className="material-symbols-outlined card-bg-icon">bolt</span>
              </div>
            </section>

            {/* Kanban Preview Section */}
            <section className="kanban-preview">
              <div className="section-header">
                <h3 className="section-title">Current Sprint</h3>
                <div className="section-options">
                  <span className="material-symbols-outlined option-icon">filter_list</span>
                  <span className="material-symbols-outlined option-icon">more_horiz</span>
                </div>
              </div>

              <div className="kanban-columns">
                {/* Backlog Column */}
                <div className="kanban-column">
                  <div className="column-header">
                    <div className="header-title">
                      <span className="column-dot dot-gray"></span>
                      <span>Backlog</span>
                    </div>
                    <span className="column-count">4</span>
                  </div>
                  
                  <div className="kanban-card glass-card" onClick={() => navigate("/tasks")}>
                    <div className="card-top">
                      <span className="priority-badge low">Low</span>
                      <span className="material-symbols-outlined card-icon">attachment</span>
                    </div>
                    <p className="card-desc">Refactor global state management for Dashboard shell.</p>
                    <div className="card-bottom">
                      <div className="member-initials">JS</div>
                      <div className="comments-count">
                        <span className="material-symbols-outlined">chat_bubble</span>
                        <span>2</span>
                      </div>
                    </div>
                  </div>

                  <div className="add-task-dashed" onClick={() => navigate("/tasks")}>
                    <span className="material-symbols-outlined">add</span>
                    <span>Add Task</span>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="kanban-column">
                  <div className="column-header">
                    <div className="header-title">
                      <span className="column-dot dot-blue animate-glow"></span>
                      <span>In Progress</span>
                    </div>
                    <span className="column-count">2</span>
                  </div>

                  <div className="kanban-card glass-card active-pill" onClick={() => navigate("/tasks")}>
                    <div className="card-top">
                      <span className="priority-badge high">High</span>
                      <span className="material-symbols-outlined card-icon">timer</span>
                    </div>
                    <p className="card-desc">Integrate WebGL shader backgrounds for premium workspace feel.</p>
                    <div className="card-bottom">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Assignee" className="assignee-avatar" />
                      <div className="comments-count">
                        <span className="material-symbols-outlined">visibility</span>
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Column */}
                <div className="kanban-column">
                  <div className="column-header">
                    <div className="header-title">
                      <span className="column-dot dot-orange"></span>
                      <span>Review</span>
                    </div>
                    <span className="column-count">1</span>
                  </div>

                  <div className="kanban-card glass-card" onClick={() => navigate("/tasks")}>
                    <div className="card-top">
                      <span className="priority-badge medium">Medium</span>
                      <span className="material-symbols-outlined card-icon text-secondary">verified</span>
                    </div>
                    <p className="card-desc">Final QA on glassmorphic card interaction patterns.</p>
                    <div className="card-bottom">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="Assignee" className="assignee-avatar" />
                      <div className="comments-count">
                        <span className="material-symbols-outlined">forum</span>
                        <span>8</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Column */}
                <div className="kanban-column completed-column">
                  <div className="column-header">
                    <div className="header-title">
                      <span className="column-dot dot-green"></span>
                      <span>Completed</span>
                    </div>
                    <span className="column-count">12</span>
                  </div>

                  <div className="kanban-card glass-card completed-task" onClick={() => navigate("/tasks")}>
                    <div className="card-top">
                      <span className="priority-badge done">Done</span>
                      <span className="material-symbols-outlined card-icon text-secondary">check_circle</span>
                    </div>
                    <p className="card-desc line-through">Draft brand anchors for the new Q3 roadmap.</p>
                    <div className="card-bottom">
                      <div className="member-initials done">AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Team Pulse */}
      <aside className="dashboard-sidebar custom-scrollbar">
        <div className="pulse-header">
          <span className="pulse-tag">Team Pulse</span>
          <h3 className="pulse-title">Live Updates</h3>
        </div>

        {/* Mini Calendar Widget */}
        <Calendar />

        {/* Upcoming events list */}
        <div className="upcoming-events">
          <div className="upcoming-header">
            <h5 className="section-sub-title">Upcoming</h5>
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
          </div>
          <div className="events-list">
            <div className="event-item border-error">
              <span className="event-name">Client Presentation</span>
              <div className="event-meta">
                <span className="event-time">Tomorrow, 10:00 AM</span>
                <span className="event-badge urgent">Urgent</span>
              </div>
            </div>
            <div className="event-item border-primary">
              <span className="event-name">Weekly Sync</span>
              <div className="event-meta">
                <span className="event-time">Friday, 02:00 PM</span>
                <span className="event-time text-right">4 members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-feed">
          <div className="activity-header">
            <h5 className="section-sub-title">Activity Feed</h5>
            <span className="material-symbols-outlined text-secondary">history</span>
          </div>
          <div className="activity-timeline">
            <div className="timeline-item">
              <div className="timeline-icon bg-secondary">
                <span className="material-symbols-outlined">done_all</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Jordan</strong> completed <span className="text-primary">Styleguide v2</span></p>
                <span className="activity-time">2 mins ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-surface-high text-primary">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Elena</strong> left a comment on <span className="text-primary">Auth Flow</span></p>
                <span className="activity-time">15 mins ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon avatar-icon">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80" alt="Marcus" />
              </div>
              <div className="timeline-content">
                <p className="activity-text"><strong>Marcus</strong> joined the <span className="text-primary">Dev Workspace</span></p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Action Button */}
      <button className="fab-button active-pill" onClick={handleCreate}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}

export default Dashboard;
