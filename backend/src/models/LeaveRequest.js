import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
        leaveType: {
            type: String,
            enum: ["sick", "casual", "earned", "unpaid", "other"],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },
        cancelReason: {
            type: String,
            trim: true,
            default: null,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export default LeaveRequest;
