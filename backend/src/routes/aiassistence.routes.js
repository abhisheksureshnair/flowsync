import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
  addAIModel,
  aiassistence,
  aiChat,
  fetchAIModels,
} from "../controllers/aiassistence.controller.js";

const route = express.Router();

route.get("/assistence", auth, aiassistence);
route.post("/addmodel", auth, addAIModel);
route.get("/fetchmodels", auth, fetchAIModels);
route.post("/aiChat", auth, aiChat);

export default route;
