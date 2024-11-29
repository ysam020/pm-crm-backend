import express from "express";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get(
  "/api/get-all-attendances/:year/:month",
  verifySession,
  async (req, res) => {
    try {
      const { year, month } = req.params;

      const queryYear = parseInt(year);
      const queryMonth = parseInt(month) - 1; // Month is 0-indexed in JS Dates

      const firstDayOfMonth = new Date(queryYear, queryMonth, 1);
      const currentDate = new Date();
      const isCurrentMonth =
        queryYear === currentDate.getFullYear() &&
        queryMonth === currentDate.getMonth();

      const lastDayOfMonth = isCurrentMonth
        ? currentDate // Use today if querying the current month
        : new Date(queryYear, queryMonth + 1, 0); // Last day of the queried month otherwise

      const allDaysInMonth = [];
      for (
        let d = new Date(firstDayOfMonth);
        d <= lastDayOfMonth;
        d.setDate(d.getDate() + 1)
      ) {
        allDaysInMonth.push(new Date(d)); // Push a copy of the date
      }

      const calculateStatus = (timeIn, timeOut) => {
        if (!timeIn || !timeOut) return "Leave";

        const duration =
          (new Date(timeOut) - new Date(timeIn)) / (1000 * 60 * 60); // Duration in hours
        if (duration >= 8) return "Present";
        if (duration >= 4.5 && duration < 8) return "Half Day";
        return "Leave";
      };

      const allAttendanceRecords = await AttendanceModel.find();

      if (!allAttendanceRecords || allAttendanceRecords.length === 0) {
        return res.status(404).json({ message: "No attendance records found" });
      }

      const userAttendanceSummary = {};

      allAttendanceRecords.forEach((record) => {
        const { username, attendance } = record;

        if (!userAttendanceSummary[username]) {
          userAttendanceSummary[username] = {
            presents: 0,
            leaves: 0,
            halfDays: 0,
          };
        }

        // Map dates with attendance entries for quick lookup
        const attendanceMap = {};
        attendance.forEach((entry) => {
          const entryDate = new Date(entry.date).toISOString().split("T")[0]; // Normalize to YYYY-MM-DD
          attendanceMap[entryDate] = entry;
        });

        // Check each day in the queried month
        allDaysInMonth.forEach((date) => {
          const dayKey = date.toISOString().split("T")[0]; // Normalize date for comparison
          const entry = attendanceMap[dayKey];

          if (entry) {
            const status = calculateStatus(entry.timeIn, entry.timeOut);
            if (status === "Present")
              userAttendanceSummary[username].presents++;
            else if (status === "Half Day")
              userAttendanceSummary[username].halfDays++;
            else userAttendanceSummary[username].leaves++;
          } else {
            // No record for this day, count as leave
            userAttendanceSummary[username].leaves++;
          }
        });
      });

      const summary = Object.keys(userAttendanceSummary).map((username) => ({
        username,
        ...userAttendanceSummary[username],
      }));

      res.status(200).json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
