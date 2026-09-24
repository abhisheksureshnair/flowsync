import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    getAttendence,
    getLeaveDeatails,
    requestLeave,
    cancelLeave,
    fetchLeaveRequests,
    getLeaveOptions,
    getDailyLogs,
} from "../controllers/attendence.controller.js";

const route = express.Router();

route.get("/assistence", auth, getAttendence);
route.get("/getleave", auth, getLeaveDeatails);
route.post("/request", auth, requestLeave);
route.patch("/cancel/:id", auth, cancelLeave);
route.get("/requests", auth, fetchLeaveRequests);
route.get("/logs", auth, getDailyLogs);
route.get("/options", getLeaveOptions);

export default route;
