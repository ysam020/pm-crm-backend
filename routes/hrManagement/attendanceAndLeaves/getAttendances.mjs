import express from "express";
import jwt from "jsonwebtoken";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-attendances", verifySession, async (req, res) => {
  try {
    // Extract and verify the token
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Fetch attendances for the user
    const attendanceRecord = await AttendanceModel.findOne({ username });

    if (!attendanceRecord) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    const attendanceData = attendanceRecord.attendance;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ); // Get the first day of the current month
    currentDate.setHours(0, 0, 0, 0); // Ensure currentDate has no time part

    // Helper to calculate attendance status
    const calculateStatus = (timeIn, timeOut) => {
      // If either timeIn or timeOut is missing, return "Leave"
      if (!timeIn || !timeOut) return "Leave";

      const duration =
        (new Date(timeOut) - new Date(timeIn)) / (1000 * 60 * 60);
      if (duration >= 8) return "Present";
      if (duration >= 4.5 && duration < 8) return "Half Day";
      return "Leave";
    };

    // Prepare attendance status for each day of the current month
    const attendanceReport = [];

    // Map attendance data by date for easier lookup
    const attendanceMap = new Map();
    attendanceData.forEach((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0); // Reset to compare only the date part
      if (recordDate >= firstDayOfMonth && recordDate <= currentDate) {
        attendanceMap.set(recordDate.getTime(), {
          date: recordDate,
          timeIn: record.timeIn,
          timeOut: record.timeOut || "", // Return empty string if timeOut is not available
          remarks: record.remarks || "", // Return empty string if remarks are not available
        });
      }
    });

    // Generate the report for the current month (from 1st to current day)
    for (
      let day = firstDayOfMonth;
      day <= currentDate;
      day.setDate(day.getDate() + 1)
    ) {
      const dateToCheck = new Date(day);
      const attendanceForDate = attendanceMap.get(dateToCheck.getTime());

      if (attendanceForDate) {
        // If attendance exists for this day
        attendanceReport.push({
          date: dateToCheck,
          status: calculateStatus(
            attendanceForDate.timeIn,
            attendanceForDate.timeOut
          ),
          timeIn: attendanceForDate.timeIn,
          timeOut: attendanceForDate.timeOut,
          remarks: attendanceForDate.remarks,
        });
      } else {
        // If no attendance record for this day
        attendanceReport.push({
          date: dateToCheck,
          status: "Leave",
          timeIn: "",
          timeOut: "",
          remarks: "",
        });
      }
    }

    res.status(200).json(attendanceReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
