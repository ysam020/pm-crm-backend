import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/add-leave", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const { from, to, reason, sick_leave, medical_certificate } = req.body;

    const startDate = new Date(from);
    const endDate = new Date(to);

    let userLeave = await UserModel.findOne({ username });

    const currentMonth = new Date().getMonth(); // Current month (0-11)
    const monthsRemaining = 12 - currentMonth; // Remaining months in the current year
    let remainingPaidLeaves = userLeave.totalPaidLeaves
      ? userLeave.totalPaidLeaves
      : monthsRemaining * 1.5; // 1.5 paid leaves for each remaining month

    const monthEntriesToPush = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthYear = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      const rangeEnd = endDate < nextMonth ? endDate : new Date(nextMonth - 1);

      let monthEntry = userLeave.leaves.find(
        (entry) => entry.month_year === monthYear
      );

      if (!monthEntry) {
        monthEntry = { month_year: monthYear, leaves: [] };
        monthEntriesToPush.push(monthEntry);
      }

      const existingLeave = monthEntry.leaves.find(
        (leave) =>
          leave.from.getTime() === currentDate.getTime() &&
          leave.to.getTime() === rangeEnd.getTime()
      );

      if (!existingLeave) {
        const leaveDaysInRange =
          Math.floor((rangeEnd - currentDate) / (1000 * 60 * 60 * 24)) + 1;

        let paidLeaves = 0;
        let unpaidLeaves = 0;

        if (isNaN(leaveDaysInRange) || leaveDaysInRange <= 0) {
          throw new Error("Invalid leave duration");
        }

        // If there are no paid leaves available, all leaves are unpaid
        if (remainingPaidLeaves === 0) {
          paidLeaves = 0;
          unpaidLeaves = leaveDaysInRange;
        } else {
          // Handle case where some paid leaves are available
          if (currentDate.getMonth() === rangeEnd.getMonth()) {
            // If the leave is within the same month
            paidLeaves = Math.min(remainingPaidLeaves, leaveDaysInRange);
            unpaidLeaves = leaveDaysInRange - paidLeaves;
          } else {
            const daysInCurrentMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            ).getDate();
            const daysLeftInCurrentMonth =
              daysInCurrentMonth - currentDate.getDate() + 1;

            // Allocate paid leave for the current month
            const paidInCurrentMonth = Math.min(
              remainingPaidLeaves,
              daysLeftInCurrentMonth
            );
            paidLeaves += paidInCurrentMonth;

            const remainingLeaveDays = leaveDaysInRange - paidInCurrentMonth;
            paidLeaves += Math.min(remainingPaidLeaves, remainingLeaveDays);

            unpaidLeaves = leaveDaysInRange - paidLeaves;
          }
        }

        paidLeaves = isNaN(paidLeaves) ? 0 : paidLeaves;
        unpaidLeaves = isNaN(unpaidLeaves) ? 0 : unpaidLeaves;

        remainingPaidLeaves -= paidLeaves;

        // Ensure remainingPaidLeaves doesn't go negative
        remainingPaidLeaves = Math.max(remainingPaidLeaves, 0);

        const leaveEntry = {
          from: currentDate,
          to: rangeEnd,
          reason,
          sick_leave,
          medical_certificate,
          paidLeaves: paidLeaves,
          unpaidLeaves: unpaidLeaves,
          status: "Pending", // Assuming leave is pending by default
        };

        monthEntry.leaves.push(leaveEntry);
        userLeave.markModified("leaves");
      } else {
        return res.status(200).json({
          message: "Already applied for leave in this date range",
        });
      }

      currentDate = new Date(nextMonth);
    }

    // Add all the new month entries to the leaves array
    userLeave.leaves.push(...monthEntriesToPush);

    // Update the user's total paid leaves after all leave entries have been processed
    userLeave.totalPaidLeaves = remainingPaidLeaves;

    // Ensure totalPaidLeaves is a valid number
    userLeave.totalPaidLeaves = isNaN(userLeave.totalPaidLeaves)
      ? 0
      : userLeave.totalPaidLeaves;

    // Save the updated user leave data
    const savedUserLeave = await userLeave.save();

    // Send response back to the client
    res.status(200).json({
      message: "Leave added successfully.",
      totalPaidLeaves: savedUserLeave.totalPaidLeaves,
      leaves: savedUserLeave.leaves,
    });
  } catch (error) {
    console.error("Error adding leave:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

export default router;
