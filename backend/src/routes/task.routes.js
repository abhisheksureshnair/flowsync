import express from "express";
import { addNewTask } from "../controllers/task.controller.js";

const route = express.Router();

route.post("/addnewtask", addNewTask);

export default route;
