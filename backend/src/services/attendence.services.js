import { Attendance } from "../models/Attendance.js";
import { LeaveRequest } from "../models/LeaveRequest.js";

export const fetchUserAttendance = async (userId, teamId = null) => {
  if (!userId) return null;

  let attendance = null;
  if (teamId) {
    attendance = await Attendance.findOne({ user: userId, team: teamId });
  }

  if (!attendance) {
    attendance = await Attendance.findOne({ user: userId }).sort({ _id: -1 });
  }

  return attendance;
};

export const getUserTotalAttendance = async (userId, teamId = null) => {
  const attendance = await fetchUserAttendance(userId, teamId);
  const days = attendance?.totalattence ?? 0;
  const totalWorkHours = (attendance?.totalWorkHours > 0)
    ? attendance.totalWorkHours
    : days * 8;
  return { days, totalWorkHours };
};

export const getUserLeaveDetails = async (userId, teamId = null) => {
  const attendance = await fetchUserAttendance(userId, teamId);

  return {
    remainingLeavesofMonth: attendance?.remainingLeavesofMonth ?? 2,
    pendingLeaves: attendance?.pendingLeaves ?? 0,
    approvedLeaves: attendance?.approvedLeaves ?? 0,
    rejectedLeaves: attendance?.rejectedLeaves ?? 0,
  };
};

export const getUserDailyLogs = async (userId, teamId = null) => {
  const attendance = await fetchUserAttendance(userId, teamId);

  // Build 25th-to-25th cycle bounds
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  let cycleStart, cycleEnd;
  if (day >= 25) {
    cycleStart = new Date(year, month, 25);
    cycleEnd   = new Date(year, month + 1, 25);
  } else {
    cycleStart = new Date(year, month - 1, 25);
    cycleEnd   = new Date(year, month, 25);
  }

  // Build a map of stored daily logs keyed by ISO date string (YYYY-MM-DD)
  const logMap = {};
  (attendance?.dailyLogs ?? []).forEach((l) => {
    const key = new Date(l.date).toISOString().slice(0, 10);
    logMap[key] = { type: l.type, note: l.note };
  });

  // Iterate every day in the cycle up to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = [];

  for (let d = new Date(cycleStart); d <= cycleEnd; d.setDate(d.getDate() + 1)) {
    const isoKey  = d.toISOString().slice(0, 10);
    const weekday = d.getDay(); // 0=Sun, 6=Sat
    const isFuture = d > today;

    let type = "absent";
    if (weekday === 0 || weekday === 6) type = "weekend";
    else if (logMap[isoKey]) type = logMap[isoKey].type;
    else if (isFuture) type = "future";

    result.push({
      date: isoKey,
      type,
      note: logMap[isoKey]?.note ?? "",
      isFuture,
    });
  }

  return result;
};


export const createLeaveRequest = async (userId, teamId, payload) => {
  const { leaveType, startDate, endDate, reason } = payload;

  if (!leaveType || !startDate || !endDate || !reason) {
    const err = new Error("leaveType, startDate, endDate, and reason are required.");
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    const err = new Error("Invalid date format for startDate or endDate.");
    err.statusCode = 400;
    throw err;
  }

  if (end < start) {
    const err = new Error("endDate cannot be before startDate.");
    err.statusCode = 400;
    throw err;
  }

  const conflict = await LeaveRequest.findOne({
    user: userId,
    status: { $in: ["pending", "approved"] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } },
    ],
  });

  if (conflict) {
    const err = new Error("A leave request already exists for the selected date range.");
    err.statusCode = 409;
    throw err;
  }

  const leaveRequest = await LeaveRequest.create({
    user: userId,
    team: teamId || null,
    leaveType,
    startDate: start,
    endDate: end,
    reason,
    status: "pending",
  });

  return leaveRequest;
};

export const cancelLeaveRequest = async (userId, leaveRequestId, cancelReason = null) => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId);

  if (!leaveRequest) {
    const err = new Error("Leave request not found.");
    err.statusCode = 404;
    throw err;
  }

  const ownerId = leaveRequest.user.toString();
  const requesterId = userId.toString();

  if (ownerId !== requesterId) {
    const err = new Error("Forbidden: You can only cancel your own leave requests.");
    err.statusCode = 403;
    throw err;
  }

  if (leaveRequest.status === "cancelled") {
    const err = new Error("Leave request is already cancelled.");
    err.statusCode = 400;
    throw err;
  }

  if (leaveRequest.status === "approved") {
    const err = new Error("Cannot cancel an already approved leave. Contact your manager.");
    err.statusCode = 400;
    throw err;
  }

  leaveRequest.status = "cancelled";
  leaveRequest.cancelReason = cancelReason || null;
  await leaveRequest.save();

  return leaveRequest;
};

export const getAllLeaveRequests = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  // Filter by leaveType
  if (filters.leaveType) {
    query.leaveType = filters.leaveType;
  }

  const leaveRequests = await LeaveRequest.find(query)
    .sort({ createdAt: -1 })
    .populate("reviewedBy", "name email");

  return leaveRequests;
};
