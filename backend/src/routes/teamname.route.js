import express from "express";
import {
    addteamName,
    fetchteam
} from "../controllers/teamname.controller.js";

const route = express.Router();

route.get("/fetchteamname", fetchteam);
route.post("/addteamname", addteamName);


export default route;
