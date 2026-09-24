import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
// console.log(process.env.MONGODB_URI);
connectDB();

// Create HTTP Server
const httpServer = createServer(app);

// Create Socket.IO Server
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"]
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
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
    try {
      console.log("Socket sendMessage:", data);
      const { sender, receiver, message } = data;
      if (!sender || !receiver || !message) return;

      const [senderUser, receiverUser] = await Promise.all([
        User.findById(sender).select("team teamId"),
        User.findById(receiver).select("team teamId"),
      ]);

      if (!senderUser || !receiverUser) {
        console.warn("Sender or receiver not found in DB:", { sender, receiver });
        return;
      }

      const senderTeamId = senderUser.teamId?.toString();
      const receiverTeamId = receiverUser.teamId?.toString();
      const senderTeam = senderUser.team?.trim();
      const receiverTeam = receiverUser.team?.trim();

      const sameTeam =
        (senderTeamId && receiverTeamId && senderTeamId === receiverTeamId) ||
        (senderTeam && receiverTeam && senderTeam.toLowerCase() === receiverTeam.toLowerCase());

      if (!sameTeam && (senderTeam || receiverTeam || senderTeamId || receiverTeamId)) {
        console.warn("Blocked cross-team socket message attempt between", sender, "and", receiver);
        return;
      }

      const chat = await Chat.create({
        sender,
        receiver,
        message,
        team: senderUser.team || receiverUser.team || "",
        teamId: senderUser.teamId || receiverUser.teamId || null,
      });

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", chat);
      }
    } catch (err) {
      console.error("Error in socket sendMessage handler:", err);
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
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
