import express from "express";
import {
  addNewTask,
  getAllTask,
  getUseraddedTask,
  getUserTask,
  updateTaskStatus,
  updateTask,
} from "../controllers/task.controller.js";
import auth from "../middleware/auth.middleware.js";

const route = express.Router();

route.post("/addnewtask", auth, addNewTask);
route.get("/getuseraddtask", auth, getUseraddedTask);
route.get("/getusertask", auth, getUserTask);
route.get("/getalltask", auth, getAllTask);

// Update task status (assigned user can change status)
route.patch("/:id/status", auth, updateTaskStatus);
route.put("/:id/status", auth, updateTaskStatus);
route.patch("/updatestatus/:id", auth, updateTaskStatus);
route.put("/updatestatus/:id", auth, updateTaskStatus);

// Full task update
route.patch("/:id", auth, updateTask);
route.put("/:id", auth, updateTask);

export default route;
