import express from "express";
import {
  allChat,
  reciveChat,
  sendChat,
} from "../controllers/chat.controller.js";
import auth from "../middleware/auth.middleware.js";

const route = express.Router();

route.get("/all", auth, allChat);
route.post("/send", auth, sendChat);
route.post("/fetchchat", auth, reciveChat);

export default route;
