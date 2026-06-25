import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";
import "../styles/tasks.css";

function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const tasksData = {
    todo: [
      {
        id: "task-1",
        title: "Refactor Authentication Flow",
        desc: "Update JWT handling to support refresh tokens and multi-session persistence.",
        priority: "High",
        date: "Oct 12",
        progress: 15,
        comments: 3,
        attachments: 1,
        subtasks: [
          { title: "Update database schema for tokens", checked: true },
          { title: "Implement /refresh-token endpoint", checked: false }
        ]
      },
      {
        id: "task-2",
        title: "Design System Audit",
        desc: "Review all shared components for consistency with the new glassmorphic theme.",
        priority: "Medium",
        date: "Oct 15",
        progress: 0,
        comments: 8,
        attachments: 0,
        subtasks: [
          { title: "Check button hover states", checked: false },
          { title: "Review input border glows", checked: false }
        ]
      }
    ],
    inprogress: [
      {
        id: "task-3",
        title: "Mobile Navigation Update",
        desc: "Implementing the responsive pivot for BottomNavBar on touch devices.",
        priority: "Low",
        date: "Today",
        progress: 65,
        comments: 12,
        attachments: 4,
        subtasks: [
          { title: "Create media query breakpoints", checked: true },
          { title: "Implement swipe gestures", checked: false }
        ]
      }
    ],
    review: [
      {
        id: "task-4",
        title: "API Gateway Stress Test",
        desc: "Validate performance under 10k concurrent connections for the new sync engine.",
        priority: "High",
        date: "Oct 10",
        progress: 95,
        comments: 2,
        attachments: 0,
        subtasks: [
          { title: "Write load testing scripts", checked: true },
          { title: "Review bottleneck logs", checked: true }
        ]
      }
    ],
    completed: [
      {
        id: "task-5",
        title: "Draft Q4 Roadmap",
        desc: "Collaborate with product managers to write down deliverables for Q4 releases.",
        priority: "Low",
        date: "Done",
        progress: 100,
        comments: 0,
        attachments: 0,
        subtasks: []
      }
    ]
  };

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Body */}
      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search tasks, docs, or people..." />
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

        <div className="tasks-container custom-scrollbar">
          {/* Header Block */}
          <div className="tasks-header">
            <div>
              <h2 className="tasks-title">Tasks Workspace</h2>
              <p className="tasks-subtitle">Manage your team's workflow and performance in real-time.</p>
            </div>

            <div className="tasks-action-bar">
              <div className="team-avatar-stack">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Sarah" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="Marcus" />
                <div className="avatar-plus">+4</div>
              </div>
              <button className="filter-btn">
                <span className="material-symbols-outlined">filter_list</span>
                <span>Filter</span>
              </button>
              <button className="filter-btn">
                <span className="material-symbols-outlined">sort</span>
                <span>Sort</span>
              </button>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="board-grid">
            {/* Columns */}
            {/* Column 1: To Do */}
            <div className="board-col">
              <div className="col-header-bar">
                <div className="col-title-block">
                  <span className="dot dot-outline"></span>
                  <h4>To Do</h4>
                  <span className="col-badge">2</span>
                </div>
                <button className="col-options-btn"><span className="material-symbols-outlined">more_horiz</span></button>
              </div>
              
              <div className="col-cards-list">
                {tasksData.todo.map((task) => (
                  <div key={task.id} className="board-task-card glass-card" onClick={() => handleCardClick(task)}>
                    <div className="card-top-row">
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="material-symbols-outlined">edit</span>
                    </div>
                    <h5 className="card-task-title">{task.title}</h5>
                    <p className="card-task-desc">{task.desc}</p>
                    {task.progress > 0 && (
                      <div className="task-progress-box">
                        <div className="task-progress-line" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    )}
                    <div className="card-bottom-row">
                      <div className="member-avatar-mini">JS</div>
                      <div className="card-metrics">
                        {task.comments > 0 && (
                          <div className="metric-item">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <span>{task.comments}</span>
                          </div>
                        )}
                        {task.attachments > 0 && (
                          <div className="metric-item">
                            <span className="material-symbols-outlined">attach_file</span>
                            <span>{task.attachments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="dashed-add-card">
                  <span className="material-symbols-outlined">add</span>
                  <span>Add Task</span>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="board-col">
              <div className="col-header-bar">
                <div className="col-title-block">
                  <span className="dot dot-primary animate-glow"></span>
                  <h4>In Progress</h4>
                  <span className="col-badge">1</span>
                </div>
                <button className="col-options-btn"><span className="material-symbols-outlined">more_horiz</span></button>
              </div>

              <div className="col-cards-list">
                {tasksData.inprogress.map((task) => (
                  <div key={task.id} className="board-task-card glass-card active-border-primary" onClick={() => handleCardClick(task)}>
                    <div className="card-top-row">
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="material-symbols-outlined">timer</span>
                    </div>
                    <h5 className="card-task-title">{task.title}</h5>
                    <p className="card-task-desc">{task.desc}</p>
                    <div className="task-progress-box">
                      <div className="task-progress-line" style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <div className="card-bottom-row">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="Assignee" className="avatar-img-mini" />
                      <div className="card-metrics">
                        <div className="metric-item">
                          <span className="material-symbols-outlined">visibility</span>
                          <span>{task.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Review */}
            <div className="board-col">
              <div className="col-header-bar">
                <div className="col-title-block">
                  <span className="dot dot-tertiary"></span>
                  <h4>Review</h4>
                  <span className="col-badge">1</span>
                </div>
                <button className="col-options-btn"><span className="material-symbols-outlined">more_horiz</span></button>
              </div>

              <div className="col-cards-list">
                {tasksData.review.map((task) => (
                  <div key={task.id} className="board-task-card glass-card" onClick={() => handleCardClick(task)}>
                    <div className="card-top-row">
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="material-symbols-outlined text-secondary">verified</span>
                    </div>
                    <h5 className="card-task-title">{task.title}</h5>
                    <p className="card-task-desc">{task.desc}</p>
                    <div className="card-bottom-row">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="Assignee" className="avatar-img-mini" />
                      <div className="card-metrics">
                        <div className="metric-item">
                          <span className="material-symbols-outlined">forum</span>
                          <span>{task.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Completed */}
            <div className="board-col completed-column-opacity">
              <div className="col-header-bar">
                <div className="col-title-block">
                  <span className="dot dot-secondary"></span>
                  <h4>Completed</h4>
                  <span className="col-badge">12</span>
                </div>
                <button className="col-options-btn"><span className="material-symbols-outlined">more_horiz</span></button>
              </div>

              <div className="col-cards-list">
                {tasksData.completed.map((task) => (
                  <div key={task.id} className="board-task-card glass-card task-grey-scale" onClick={() => handleCardClick(task)}>
                    <div className="card-top-row">
                      <span className="priority-pill done">Done</span>
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                    </div>
                    <h5 className="card-task-title line-through">{task.title}</h5>
                    <p className="card-task-desc">{task.desc}</p>
                    <div className="card-bottom-row">
                      <div className="member-avatar-mini done">AM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab-button active-pill">
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Side Details Drawer */}
      {selectedTask && (
        <div className={`details-drawer ${isDrawerOpen ? "open" : ""}`}>
          <div className="drawer-panel">
            <div className="drawer-header">
              <span className="drawer-tag">Task Detail</span>
              <button className="close-drawer-btn" onClick={closeDrawer}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body custom-scrollbar">
              <div className="drawer-title-section">
                <span className={`priority-pill ${selectedTask.priority.toLowerCase()} mb-sm`}>
                  {selectedTask.priority} Priority
                </span>
                <h3 className="drawer-task-title">{selectedTask.title}</h3>
                <div className="drawer-meta-row">
                  <span className="material-symbols-outlined">calendar_month</span>
                  <span>Created on Oct 08, 2026</span>
                </div>
              </div>

              <div className="drawer-details-list">
                {/* Description */}
                <div className="drawer-detail-card">
                  <span className="detail-card-label">Description</span>
                  <p className="detail-card-content">{selectedTask.desc}</p>
                </div>

                {/* Assignee & Due Date Row */}
                <div className="detail-grid-row">
                  <div className="drawer-detail-card">
                    <span className="detail-card-label">Assignee</span>
                    <div className="assignee-block">
                      <div className="avatar-placeholder-blue"></div>
                      <span className="assignee-name">Alex Rivera</span>
                    </div>
                  </div>
                  <div className="drawer-detail-card">
                    <span className="detail-card-label">Due Date</span>
                    <div className="due-date-block text-error">
                      <span className="material-symbols-outlined">alarm</span>
                      <span className="due-date-text">{selectedTask.date} {selectedTask.date !== "Done" && "(Overdue)"}</span>
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div className="drawer-subtasks-section">
                    <span className="detail-card-label">Subtasks</span>
                    <div className="subtasks-list">
                      {selectedTask.subtasks.map((sub, i) => (
                        <div key={i} className="subtask-row">
                          <span className={`material-symbols-outlined ${sub.checked ? "text-primary" : "text-outline"}`}>
                            {sub.checked ? "check_box" : "check_box_outline_blank"}
                          </span>
                          <span className="subtask-title">{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn-primary flex-1" onClick={closeDrawer}>Mark Complete</button>
              <button className="btn-secondary"><span className="material-symbols-outlined">share</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
