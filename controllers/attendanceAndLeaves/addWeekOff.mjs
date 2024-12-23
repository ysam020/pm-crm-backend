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

    const weekOffDate = new Date(date);
    if (isNaN(weekOffDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Extract the month and year from the provided date
    const applyingMonth = weekOffDate.getMonth(); // 0-indexed
    const applyingYear = weekOffDate.getFullYear();

    // Find the user's attendance record or create one if not found
    let attendanceRecord = await AttendanceModel.findOne({ username });

    if (!attendanceRecord) {
      attendanceRecord = new AttendanceModel({
        username,
        attendance: [],
      });
    }

    // Check if a record already exists for the given date
    const existingEntry = attendanceRecord.attendance.find(
      (record) =>
        new Date(record.date).toISOString() === weekOffDate.toISOString()
    );

    if (existingEntry) {
      return res
        .status(400)
        .json({ message: `Week Off already applied on this date` });
    }

    // Check if more than 4 week offs have already been applied for the month
    const weekOffCount = attendanceRecord.attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.type === "Week Off" &&
        recordDate.getMonth() === applyingMonth &&
        recordDate.getFullYear() === applyingYear
      );
    }).length;

    if (weekOffCount >= 4) {
      return res.status(400).json({
        message: `Cannot apply for more than 4 Week Offs in ${weekOffDate.toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        )}`,
      });
    }

    // Check for consecutive week off restriction
    const appliedWeekOffDates = attendanceRecord.attendance
      .filter((record) => record.type === "Week Off")
      .map((record) => new Date(record.date).getTime());

    const dayInMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
    const currentDay = weekOffDate.getTime();

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
        consecutiveCount = 1; // Reset counter if dates are not consecutive
      }
    }

    const id = new mongoose.Types.ObjectId();

    // Add a new entry with the status "Week Off"
    attendanceRecord.attendance.push({
      _id: id,
      date: weekOffDate,
      type: "Week Off",
      timeIn: null,
      timeOut: null,
      remarks: null,
    });

    // Save the updated attendance record
    await attendanceRecord.save();

    const io = req.app.get("io");

    addNotification(
      io,
      decoded.department,
      "Week Off Request",
      `${username} has applied for Week Off on ${weekOffDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-")}`,
      decoded.rank,
      id
    );

    const payload = {
      notification: {
        title: `Week Off Request`,
        body: `${username} has applied for Week Off on ${weekOffDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")}`,
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
