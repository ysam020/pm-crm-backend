import express from "express";
import UserModel from "../../../model/userModel.mjs";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/get-attendance-summary", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Current month (0-indexed)
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    const today = new Date();

    // Get the total days in the current month up to today
    const totalDaysUpToToday = today.getDate();

    // Get attendance records for the current user
    const attendanceRecord = await AttendanceModel.findOne({ username });

    // Get the total days in the current month
    const totalDaysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    // Calculate working days (excluding 4 week offs)
    const workingDays = totalDaysInMonth - 4;

    if (!attendanceRecord) {
      return res.status(200).send({
        workingDays,
        presentCount: 0,
        totalLeaves: 0,
        paidLeaves: 0,
        unpaidLeaves: 0,
        weekOffsCount: 0,
      });
    }

    // Extract attendance entries for the current month
    const currentMonthAttendance = attendanceRecord.attendance.filter(
      (entry) =>
        new Date(entry.date) >= startDate && new Date(entry.date) <= endDate
    );

    // Create a map of all recorded dates for quick lookup
    const recordedDates = new Set(
      currentMonthAttendance.map((entry) =>
        new Date(entry.date).toISOString().slice(0, 10)
      )
    );

    // Calculate missing days (treated as leaves)
    const missingDaysCount = Array.from(
      { length: totalDaysUpToToday },
      (_, i) => {
        const date = new Date(currentYear, currentMonth, i + 1)
          .toISOString()
          .slice(0, 10); // Format: YYYY-MM-DD
        return date;
      }
    ).filter((date) => !recordedDates.has(date)).length;

    // Count explicitly recorded leaves
    const markedLeaves = currentMonthAttendance.filter(
      (entry) => entry.type === "Leave"
    ).length;

    // Total leaves = marked leaves + missing days
    const totalLeaves = markedLeaves + missingDaysCount;

    // Calculate paid and unpaid leaves
    const maxPaidLeaves = 1.5; // Fixed allowance of 1.5 paid leaves per month
    const paidLeaves = Math.min(totalLeaves, maxPaidLeaves); // Paid leaves cannot exceed the allowance
    const unpaidLeaves = totalLeaves - paidLeaves; // Remaining leaves are unpaid

    // Calculate other attendance details
    const presentCount = currentMonthAttendance.filter(
      (entry) => entry.type === "Present"
    ).length;

    const weekOffsCount = currentMonthAttendance.filter(
      (entry) => entry.type === "Week Off"
    ).length;

    res.status(200).send({
      workingDays,
      presentCount,
      totalLeaves,
      paidLeaves,
      unpaidLeaves,
      weekOffsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
