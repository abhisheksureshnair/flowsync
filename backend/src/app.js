import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routs.js";
import userRoutes from "./routes/user.routes.js";
import addNewTask from "./routes/task.routes.js";
import chat from "./routes/chat.routes.js";
import etaRoutes from "./routes/map.route.js";
import aiRoutes from "./routes/aiassistence.routes.js";
import teamnameRoutes from "./routes/teamname.route.js";
import attendence from "./routes/attendence.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/task", addNewTask);
app.use("/api/chat", chat);
app.use("/api", etaRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/teamname", teamnameRoutes);
app.use("/api/attendence", attendence);

app.get("/", (req, res) => {
  res.send("🚀 FlowSync API is running...");
});

export default app;
