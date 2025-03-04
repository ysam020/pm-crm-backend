import mongoose from "mongoose";

const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  username: { type: String, required: true },
  attendanceRecords: [
    {
      from: { type: String, required: true },
      type: {
        type: String,
        enum: ["Attendance", "Leave", "Week Off"],
        required: true,
      },
      timeIn: String,
      timeOut: String,
      workingHours: Number,
      status: {
        type: String,
        enum: ["Present", "Half Day", "Leave", "Week Off"],
      },
      approval_status: {
        type: String,
        enum: ["Approved", "Pending", "Rejected"],
      },
      to: String,
      reason: String,
      sick_leave: Boolean,
      medical_certificate: String,
      appliedOn: String,
      approvedBy: {
        username: String,
        approvedOn: String,
      },
    },
  ],
  leaveBalance: [
    {
      month: Number,
      year: Number,
      totalLeaves: { type: Number },
      paidLeaves: { type: Number, default: 1.5 },
      unpaidLeaves: { type: Number },
    },
  ],
});

const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
export default AttendanceModel;
