import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Chat from "./models/Chat.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
// console.log(process.env.MONGODB_URI);
connectDB();

// Create HTTP Server
const httpServer = createServer(app);

// Create Socket.IO Server
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

// Listen for socket connections
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);

    console.log("User Joined");
    console.log("User ID :", userId);
    console.log("Socket :", socket.id);
  });

  socket.on("sendMessage", async (data) => {
    console.log(data);
    const { sender, receiver, message } = data;
    const chat = await Chat.create({
      sender,
      receiver,
      message,
    });
    const receiverSocketId = onlineUsers.get(receiver);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", chat);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    console.log("❌ Disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
