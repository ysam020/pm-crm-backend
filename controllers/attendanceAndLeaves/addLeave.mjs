import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";
import addNotification from "../../utils/addNotification.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import convertDateFormat from "../../utils/convertDateFormat.mjs";
import mongoose from "mongoose";

const addLeave = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const { from, to, reason, sick_leave, medical_certificate } = req.body;

    const startDate = new Date(from);
    const endDate = new Date(to);

    let userLeave = await UserModel.findOne({ username });

    const monthEntriesToPush = [];
    let currentDate = new Date(startDate);
    let lastLeaveId = null; // Track the last generated leaveId

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
        monthEntry = {
          month_year: monthYear,
          leaves: [],
          totalPaidLeaves: 1.5,
        };
        monthEntriesToPush.push(monthEntry); // Push new month entry if not found
      }

      const existingLeave = monthEntry.leaves.find(
        (leave) =>
          leave.from.getTime() === currentDate.getTime() &&
          leave.to.getTime() === rangeEnd.getTime()
      );

      if (!existingLeave) {
        const leaveDaysInRange =
          Math.floor((rangeEnd - currentDate) / (1000 * 60 * 60 * 24)) + 1;

        if (isNaN(leaveDaysInRange) || leaveDaysInRange <= 0) {
          throw new Error("Invalid leave duration");
        }

        let paidLeaves = 0;
        let unpaidLeaves = 0;

        let remainingPaidLeaves = monthEntry.totalPaidLeaves || 1.5;

        if (remainingPaidLeaves === 0) {
          paidLeaves = 0;
          unpaidLeaves = leaveDaysInRange;
        } else {
          if (currentDate.getMonth() === rangeEnd.getMonth()) {
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
        remainingPaidLeaves = Math.max(remainingPaidLeaves, 0);

        const leaveId = new mongoose.Types.ObjectId();
        lastLeaveId = leaveId; // Update the lastLeaveId for each generated leave

        const leaveEntry = {
          _id: leaveId,
          from: currentDate,
          to: rangeEnd,
          reason,
          sick_leave,
          medical_certificate,
          paidLeaves: paidLeaves,
          unpaidLeaves: unpaidLeaves,
          status: "Pending",
        };

        monthEntry.leaves.push(leaveEntry);
        monthEntry.totalPaidLeaves = remainingPaidLeaves;
        userLeave.markModified("leaves");
      } else {
        return res.status(409).json({
          message: "Already applied for leave in this date range",
        });
      }

      currentDate = new Date(nextMonth);
    }

    userLeave.leaves.push(...monthEntriesToPush);
    const savedUserLeave = await userLeave.save();

    const io = req.app.get("io");

    if (lastLeaveId) {
      // Use the last generated leaveId for the notification
      addNotification(
        io,
        decoded.department,
        "Leave Request",
        `${username} has applied for leave from ${convertDateFormat(
          from
        )} to ${convertDateFormat(to)}.`,
        decoded.rank,
        lastLeaveId
      );
    }

    const payload = {
      notification: {
        title: `Leave Request`,
        body: `${username} has applied for leave from ${convertDateFormat(
          from
        )} to ${convertDateFormat(to)}.`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendDepartmentPushNotifications(
      decoded.username,
      decoded.department,
      decoded.rank,
      payload
    );

    res.status(200).json({
      message: "Leave added successfully.",
      totalPaidLeaves: savedUserLeave.totalPaidLeaves,
      leaves: savedUserLeave.leaves,
    });
  } catch (error) {
    console.error("Error adding leave:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export default addLeave;
