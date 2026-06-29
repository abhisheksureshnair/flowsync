import express from "express";
import { getDashBoard } from "../controllers/dashboard.controller.js";

const route = express.Router();

route.post("/", getDashBoard);

export default route;
