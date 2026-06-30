import express from "express";
import {
  addNewTask,
  getAllTask,
  getUseraddedTask,
  getUserTask,
} from "../controllers/task.controller.js";
import auth from "../middleware/auth.middleware.js";

const route = express.Router();

route.post("/addnewtask", auth, addNewTask);
route.get("/getuseraddtask", auth, getUseraddedTask);
route.get("/getusertask", auth, getUserTask);
route.get("/getalltask", auth, getAllTask);

export default route;
