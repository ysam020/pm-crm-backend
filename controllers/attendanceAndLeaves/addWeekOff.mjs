import AttendanceModel from "../../model/attendanceModel.mjs";
import addNotification from "../../utils/addNotification.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const addWeekOff = async (req, res) => {
  try {
    const { date } = req.body;
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    if (!username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Find the user's attendance record or create one if not found
    let attendances = await AttendanceModel.findOne({ username });

    if (!attendances) {
      const attendanceRecord = new AttendanceModel({
        username,
        attendanceRecords: [
          {
            from: date,
            to: date,
            type: "Week Off",
            status: "Week Off",
            approval_status: "Pending",
          },
        ],
        leaveBalance: [],
      });

      await attendanceRecord.save();

      res.status(200).json({ message: "Week Off applied successfully" });
      return;
    }

    // Check if a record already exists for the given date and status
    const existingEntry = attendances.attendanceRecords.find(
      (record) => record.from === date
    );

    if (existingEntry && existingEntry.status === "Week Off") {
      return res
        .status(400)
        .json({ message: `Week Off already applied on this date` });
    } else if (existingEntry) {
      // Temporarily treat the update as adding a new week off to check rules
      const appliedWeekOffDates = attendances.attendanceRecords
        .filter((record) => record.type === "Week Off")
        .map((record) => new Date(record.from).getTime());

      const dayInMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
      const currentDay = new Date(date).getTime();

      // Include the current day in the list to check for consecutive dates
      const allDates = [...appliedWeekOffDates, currentDay].sort(
        (a, b) => a - b
      );

      // Check for consecutive week-off restriction
      let consecutiveCount = 1; // Initialize the counter for consecutive days
      for (let i = 1; i < allDates.length; i++) {
        if (allDates[i] - allDates[i - 1] === dayInMs) {
          consecutiveCount++;
          if (consecutiveCount > 2) {
            return res.status(400).json({
              message: "Cannot apply for more than two consecutive Week Offs",
            });
          }
        } else {
          consecutiveCount = 1;
        }
      }

      // Check if more than 4 week-offs have already been applied for the month
      const weekOffCount = attendances.attendanceRecords.filter((record) => {
        const recordDateParts = record.from.split("-");
        const applyingDateParts = date.split("-");
        const recordYear = recordDateParts[0];
        const recordMonth = recordDateParts[1];
        const applyingYear = applyingDateParts[0];
        const applyingMonth = applyingDateParts[1];

        return (
          record.type === "Week Off" &&
          recordYear === applyingYear &&
          recordMonth === applyingMonth
        );
      }).length;

      if (weekOffCount >= 4) {
        return res.status(400).json({
          message: "Cannot apply for more than 4 Week Offs",
        });
      }

      // Update the existing record's status to "Week Off"
      existingEntry.type = "Week Off";
      existingEntry.status = "Week Off";
      existingEntry.approval_status = "Pending";

      // Save the updated attendance record
      await attendances.save();

      const io = req.app.get("io");

      addNotification(
        io,
        decoded.department,
        "Week Off Update",
        `${username}'s status on ${date} has been updated to Week Off`,
        decoded.rank,
        existingEntry._id
      );

      const payload = {
        notification: {
          title: `Week Off Update`,
          body: `${username}'s status on ${date} has been updated to Week Off`,
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

      return res
        .status(200)
        .json({ message: "Week Off status updated successfully" });
    }

    // Check if more than 4 week offs have already been applied for the month
    const weekOffCount = attendances.attendanceRecords.filter((record) => {
      const recordDateParts = record.from.split("-");
      const applyingDateParts = date.split("-");
      const recordYear = recordDateParts[0];
      const recordMonth = recordDateParts[1];
      const applyingYear = applyingDateParts[0];
      const applyingMonth = applyingDateParts[1];

      return (
        record.type === "Week Off" &&
        recordYear === applyingYear &&
        recordMonth === applyingMonth
      );
    }).length;

    if (weekOffCount >= 4) {
      return res.status(400).json({
        message: "Cannot apply for more than 4 Week Offs",
      });
    }

    // Check for consecutive week off restriction
    const appliedWeekOffDates = attendances.attendanceRecords
      .filter((record) => record.type === "Week Off")
      .map((record) => new Date(record.from).getTime());

    const dayInMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
    const currentDay = new Date(date).getTime();

    // Include the current day in the list to check for consecutive dates
    const allDates = [...appliedWeekOffDates, currentDay].sort((a, b) => a - b);

    let consecutiveCount = 1; // Initialize the counter for consecutive days
    for (let i = 1; i < allDates.length; i++) {
      if (allDates[i] - allDates[i - 1] === dayInMs) {
        consecutiveCount++;
        if (consecutiveCount > 2) {
          return res.status(400).json({
            message: "Cannot apply for more than two consecutive Week Offs",
          });
        }
      } else {
        consecutiveCount = 1;
      }
    }

    const id = new mongoose.Types.ObjectId();

    // Add a new entry with the status "Week Off"
    attendances.attendanceRecords.push({
      _id: id,
      from: date,
      to: date,
      type: "Week Off",
      status: "Week Off",
      approval_status: "Pending",
    });

    // Save the updated attendance record
    await attendances.save();

    const io = req.app.get("io");

    addNotification(
      io,
      decoded.department,
      "Week Off Request",
      `${username} has applied for Week Off on ${date}`,
      decoded.rank,
      id
    );

    const payload = {
      notification: {
        title: `Week Off Request`,
        body: `${username} has applied for Week Off on ${date}`,
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

    res.status(200).json({ message: "Week Off added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addWeekOff;
