import mongoose from "mongoose";

const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paidLeavesBalance: {
    type: Number,
    default: 15, // You can adjust the default based on your policies (e.g., 15 paid leaves per year or month)
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  leaveBreakdown: [
    {
      month: {
        type: String,
        required: true, // e.g., "2024-11"
      },
      paidLeaveDays: {
        type: Number,
        required: true,
      },
      unpaidLeaveDays: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  appliedOn: {
    type: Date,
    default: Date.now,
  },
});

const leaveModel = mongoose.model("Leave", leaveSchema);
export default leaveModel;
