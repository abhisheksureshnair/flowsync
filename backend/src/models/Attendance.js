import mongoose from 'mongoose'

const attenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    totalattence: {
        type: Number,
        request: true
    },
    totalWorkHours: {
        type: Number,
        default: 0
    },
    remainingLeavesofMonth: {
        type: Number,
        request: true
    },
    pendingLeaves: {
        type: Number,
        request: true
    },
    approvedLeaves: {
        type: Number,
        request: true
    },
    rejectedLeaves: {
        type: Number,
        request: true
    },
    dailyLogs: [
        {
            date: { type: Date, required: true },
            // 'full' | 'half' | 'leave' | 'holiday' | 'absent' | 'weekend'
            type: { type: String, enum: ["full", "half", "leave", "holiday", "absent", "weekend"], default: "absent" },
            note: { type: String, default: "" },
        }
    ],

})


export const Attendance = mongoose.model('Attendance', attenceSchema)
export default Attendance;