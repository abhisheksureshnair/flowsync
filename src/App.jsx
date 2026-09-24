import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChatScreen from "./pages/ChatScreen";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Calendar from "./components/Calender/Calendar";
import AIAssist from "./pages/AIAssist";
import Attendance from "./pages/Attendance";
import socket from "./socket/socket";
import { initTheme } from "./utils/theme";

function App() {
  useEffect(() => {
    initTheme();
    const userId = localStorage.getItem("user_id");
    if (userId) {
      socket.connect();
      socket.emit("join", userId);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/ai-assist" element={<AIAssist />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
