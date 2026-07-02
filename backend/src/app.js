import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routs.js";
import userRoutes from "./routes/user.routes.js";
import addNewTask from "./routes/task.routes.js";
import chat from "./routes/chat.routes.js";
import etaRoutes from "./routes/map.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/task", addNewTask);
app.use("/api/chat", chat);
app.use("/api", etaRoutes);

app.get("/", (req, res) => {
  res.send("🚀 FlowSync API is running...");
});

export default app;
