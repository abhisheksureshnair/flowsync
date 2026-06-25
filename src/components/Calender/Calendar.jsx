import React from "react";

export default function Calendar() {
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const days = [
    { num: 28, isCurrentMonth: false },
    { num: 29, isCurrentMonth: false },
    { num: 30, isCurrentMonth: false },
    { num: 1, isCurrentMonth: true },
    { num: 2, isCurrentMonth: true },
    { num: 3, isCurrentMonth: true, isActive: true },
    { num: 4, isCurrentMonth: true },
    { num: 5, isCurrentMonth: true },
    { num: 6, isCurrentMonth: true },
    { num: 7, isCurrentMonth: true },
    { num: 8, isCurrentMonth: true },
    { num: 9, isCurrentMonth: true },
    { num: 10, isCurrentMonth: true },
    { num: 11, isCurrentMonth: true },
    { num: 12, isCurrentMonth: true },
    { num: 13, isCurrentMonth: true },
    { num: 14, isCurrentMonth: true },
  ];

  return (
    <div className="mini-calendar glass-card">
      <div className="calendar-header">
        <span className="current-month">September 2026</span>
        <div className="calendar-nav">
          <button className="nav-arrow-btn">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="nav-arrow-btn">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      
      <div className="calendar-grid weekdays">
        {weekdays.map((day, index) => (
          <span key={index} className="grid-cell weekday-label">{day}</span>
        ))}
      </div>

      <div className="calendar-grid days">
        {days.map((day, index) => (
          <span 
            key={index} 
            className={`grid-cell day-cell ${day.isCurrentMonth ? "current" : "other"} ${day.isActive ? "active" : ""}`}
          >
            {day.num}
          </span>
        ))}
      </div>
    </div>
  );
}
