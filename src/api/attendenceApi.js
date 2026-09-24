import api from "./axios";

export const getAttendence = () => {
    return api.get("/attendence/assistence");
};


export const getLeaveDetails = () => {
    return api.get("/attendence/getleave");
};


export const requestLeave = (data) => {
    return api.post("/attendence/request", data);
};


export const cancelLeave = (id, cancelReason = null) => {
    return api.patch(`/attendence/cancel/${id}`, { cancelReason });
};


export const fetchLeaveRequests = (params = {}) => {
    return api.get("/attendence/requests", { params });
};


export const getLeaveOptions = () => {
    return api.get("/attendence/options");
};

/**
 * GET /api/attendence/logs
 * Returns per-day attendance type for each day in the current 25th–25th cycle.
 */
export const getAttendanceLogs = () => {
    return api.get("/attendence/logs");
};
