import express from "express";
import jwt from "jsonwebtoken";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get(
  "/api/get-attendances/:month/:year",
  verifySession,
  async (req, res) => {
    try {
      // Extract and verify the token
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.username;

      const { month, year } = req.params;

      const currentDate = new Date(); // Today's date
      const currentMonth = currentDate.getMonth() + 1; // Current month (1-indexed)
      const currentYear = currentDate.getFullYear(); // Current year

      // If the requested month is the same as the current month, limit data up to today's date
      const shouldLimitData =
        currentMonth === parseInt(month, 10) &&
        currentYear === parseInt(year, 10);

      // Convert month and year to start and end of the month
      const startDate = new Date(year, month - 1, 1); // month - 1 because JavaScript months are 0-indexed
      const endDate = new Date(year, month, 0); // Get the last date of the month

      // Fetch attendance for the user
      const attendanceRecord = await AttendanceModel.findOne({ username });

      // If no attendance record exists, return "Leave" for all days of the month up to today
      if (!attendanceRecord) {
        const attendanceReport = [];
        const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
        for (let day = 1; day <= daysInMonth; day++) {
          const dateToCheck = new Date(year, month - 1, day);
          if (shouldLimitData && dateToCheck > currentDate) {
            break; // Stop adding attendance data after today for the current month
          }

          attendanceReport.push({
            date: dateToCheck,
            status: "Leave", // Default to "Leave" for all days
            timeIn: "",
            timeOut: "",
            remarks: "",
          });
        }
        return res.status(200).json(attendanceReport);
      }

      const attendanceData = attendanceRecord.attendance;

      // Filter the attendance data for the specified month and year
      const filteredAttendance = attendanceData.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Map attendance data by date for easier lookup
      const attendanceMap = new Map();
      filteredAttendance.forEach((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0); // Normalize the time to midnight for comparison
        attendanceMap.set(recordDate.getTime(), {
          date: recordDate,
          status: record.type || "Leave", // Use stored type or default to "Leave"
          timeIn: record.timeIn || "",
          timeOut: record.timeOut || "",
          remarks: record.remarks || "",
        });
      });

      // Generate the attendance report for the specified month
      const attendanceReport = [];
      const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateToCheck = new Date(year, month - 1, day);
        if (shouldLimitData && dateToCheck > currentDate) {
          break; // Stop adding attendance data after today for the current month
        }

        const attendanceForDate = attendanceMap.get(dateToCheck.getTime());

        if (attendanceForDate) {
          attendanceReport.push({
            date: dateToCheck,
            status: attendanceForDate.status,
            timeIn: attendanceForDate.timeIn,
            timeOut: attendanceForDate.timeOut,
            remarks: attendanceForDate.remarks,
          });
        } else {
          attendanceReport.push({
            date: dateToCheck,
            status: "Leave", // Default to "Leave" for days with no records
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
  }
);

export default router;
