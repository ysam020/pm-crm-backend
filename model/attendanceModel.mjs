import mongoose from "mongoose";

const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  username: {
    type: String,
  },
  attendance: [
    {
      date: {
        type: Date,
      },
      timeIn: {
        type: Date,
      },
      timeOut: {
        type: Date,
      },
      remarks: {
        type: String,
      },
    },
  ],
});

const attendanceModel = mongoose.model("Attendance", attendanceSchema);
export default attendanceModel;