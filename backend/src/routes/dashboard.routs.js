import express from "express";
import { getDashBoard } from "../controllers/dashboard.controller.js";
import auth from "../middleware/auth.middleware.js";

const route = express.Router();

route.get("/", auth, getDashBoard);

export default route;
