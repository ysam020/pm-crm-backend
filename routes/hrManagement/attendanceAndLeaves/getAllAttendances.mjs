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
      const currentDate = new Date(); // Today's date

      // We only care about attendance data up to the current date of the month
      const todayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      const totalDaysInMonth = todayDate.getDate(); // Days up to today in the current month

      const allAttendanceRecords = await AttendanceModel.find({
        "attendance.date": {
          $gte: firstDayOfMonth,
          $lte: todayDate, // Only fetch records up to today's date
        },
      });

      if (!allAttendanceRecords || allAttendanceRecords.length === 0) {
        // No records found, return "Leave" for all users for the entire month up to today
        const summary = [];

        // Create summary for each user (default to "Leave" for every day up to today)
        const usernames = await AttendanceModel.distinct("username");
        usernames.forEach((username) => {
          const userSummary = {
            username,
            presents: 0,
            leaves: totalDaysInMonth,
            halfDays: 0,
            weekOffs: 0,
          };
          summary.push(userSummary);
        });

        return res.status(200).json(summary);
      }

      const userAttendanceSummary = {};

      // Initialize user summary
      allAttendanceRecords.forEach((record) => {
        const { username, attendance } = record;

        if (!userAttendanceSummary[username]) {
          userAttendanceSummary[username] = {
            presents: 0,
            leaves: 0,
            halfDays: 0,
            weekOffs: 0,
            attendedDates: new Set(), // To track the dates for which attendance exists
          };
        }

        // Filter attendance for the given month and count statuses
        attendance
          .filter(
            (entry) =>
              new Date(entry.date) >= firstDayOfMonth &&
              new Date(entry.date) <= todayDate // Only consider up to today
          )
          .forEach((entry) => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0); // Normalize date for comparison

            // Track the dates for which attendance exists
            userAttendanceSummary[username].attendedDates.add(
              entryDate.getTime()
            );

            // Increment counts based on attendance type
            if (entry.type === "Present") {
              userAttendanceSummary[username].presents++;
            } else if (entry.type === "Half Day") {
              userAttendanceSummary[username].halfDays++;
            } else if (entry.type === "Week Off") {
              userAttendanceSummary[username].weekOffs++;
            } else if (entry.type === "Leave") {
              userAttendanceSummary[username].leaves++;
            }
          });
      });

      // Now we handle the case for missing days, where we increment leaves for any missing attendance
      const summary = Object.keys(userAttendanceSummary).map((username) => {
        const userSummary = userAttendanceSummary[username];
        const attendedDaysCount = userSummary.attendedDates.size;

        // For each user, we calculate the leaves as the total days up to today minus the attended days
        let totalLeaves = totalDaysInMonth - attendedDaysCount;

        // Add leave days if the user has explicitly marked "Leave"
        totalLeaves += userSummary.leaves;

        // Return the summary
        return {
          username,
          presents: userSummary.presents,
          halfDays: userSummary.halfDays,
          weekOffs: userSummary.weekOffs,
          leaves: totalLeaves, // Adjust leaves count for missing records and explicitly marked leaves
        };
      });

      res.status(200).json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
