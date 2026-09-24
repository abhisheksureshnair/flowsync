import {
    getUserTotalAttendance,
    getUserLeaveDetails,
    fetchUserAttendance,
    createLeaveRequest,
    cancelLeaveRequest,
    getAllLeaveRequests,
    getUserDailyLogs,
} from "../services/attendence.services.js";


const extractUser = (req) => ({
    userId: req.user?.id || req.user?._id,
    teamId: req.user?.teamId || null,
});


export const getAttendence = async (req, res) => {
    try {
        const { userId, teamId } = extractUser(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        const { days, totalWorkHours } = await getUserTotalAttendance(userId, teamId);
        const attendanceRecord = await fetchUserAttendance(userId, teamId);

        return res.status(200).json({
            success: true,
            totalattence: days,
            totalAttendance: days,
            totalWorkHours,
            data: attendanceRecord || null,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const getLeaveDeatails = async (req, res) => {
    try {
        const { userId, teamId } = extractUser(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        const leaveDetails = await getUserLeaveDetails(userId, teamId);

        return res.status(200).json({
            success: true,
            remainingLeavesofMonth: leaveDetails.remainingLeavesofMonth,
            pendingLeaves: leaveDetails.pendingLeaves,
            approvedLeaves: leaveDetails.approvedLeaves,
            rejectedLeaves: leaveDetails.rejectedLeaves,
            data: leaveDetails,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
}

export const requestLeave = async (req, res) => {
    try {
        const { userId, teamId } = extractUser(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        const leaveRequest = await createLeaveRequest(userId, teamId, req.body);

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully.",
            data: leaveRequest,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const cancelLeave = async (req, res) => {
    try {
        const { userId } = extractUser(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        const { id } = req.params;
        const { cancelReason } = req.body || {};

        const updated = await cancelLeaveRequest(userId, id, cancelReason);

        return res.status(200).json({
            success: true,
            message: "Leave request cancelled successfully.",
            data: updated,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const fetchLeaveRequests = async (req, res) => {
    try {
        const { userId } = extractUser(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        const { status = "all", leaveType } = req.query;

        const leaveRequests = await getAllLeaveRequests(userId, { status, leaveType });

        // Group counts for quick overview
        const summary = leaveRequests.reduce(
            (acc, lr) => {
                acc[lr.status] = (acc[lr.status] || 0) + 1;
                return acc;
            },
            { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        );

        return res.status(200).json({
            success: true,
            total: leaveRequests.length,
            summary,
            data: leaveRequests,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const getLeaveOptions = (req, res) => {
    return res.status(200).json({
        success: true,
        leaveTypes: [
            { value: "sick", label: "Sick Leave" },
            { value: "casual", label: "Casual Leave" },
            { value: "earned", label: "Earned Leave" },
            { value: "unpaid", label: "Unpaid Leave" },
            { value: "other", label: "Other" },
        ],
        statuses: [
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "cancelled", label: "Cancelled" },
        ],
    });
};


// GET /api/attendence/logs
export const getDailyLogs = async (req, res) => {
    try {
        const { userId, teamId } = extractUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }
        const logs = await getUserDailyLogs(userId, teamId);
        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
