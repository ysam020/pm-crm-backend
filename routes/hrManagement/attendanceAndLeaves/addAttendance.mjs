import express from "express";
import verifySession from "../../../middlewares/verifySession.mjs";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/add-attendance", verifySession, async (req, res) => {
  try {
    const { timeIn, timeOut, remarks } = req.body;

    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Helper function to convert time to date with current date
    const convertToDateTime = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0); // Set hours, minutes, and reset seconds & milliseconds
      return date;
    };

    // Convert timeIn and timeOut to Date objects
    const timeInDate = timeIn ? convertToDateTime(timeIn) : null;
    const timeOutDate = timeOut ? convertToDateTime(timeOut) : null;

    // Get current date in local timezone (e.g., IST)
    const currentDate = new Date();
    const localDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ); // Normalize to midnight of local date

    // Check if the current date is already present in the attendance array
    const existingAttendance = await AttendanceModel.findOne({
      username,
      "attendance.date": localDate, // Check if attendance for localDate exists
    });

    if (existingAttendance) {
      // Prepare the update object conditionally
      const updateFields = {
        "attendance.$.timeIn": timeInDate,
        "attendance.$.remarks": remarks,
      };
      if (timeOut) {
        updateFields["attendance.$.timeOut"] = timeOutDate; // Add timeOut only if it exists
      }

      // Update the existing record for the current date
      await AttendanceModel.updateOne(
        {
          username,
          "attendance.date": localDate,
        },
        {
          $set: updateFields,
        }
      );

      res.status(200).json({ message: "Attendance updated successfully" });
    } else {
      // Prepare the new attendance object conditionally
      const newAttendance = {
        date: localDate,
        timeIn: timeInDate,
        remarks,
      };
      if (timeOut) {
        newAttendance.timeOut = timeOutDate; // Add timeOut only if it exists
      }

      // If no record exists for the current date, add a new entry
      const updatedAttendance = await AttendanceModel.findOneAndUpdate(
        { username },
        {
          $push: { attendance: newAttendance },
        },
        { new: true, upsert: true }
      );

      res.status(201).json({
        message: "Attendance added successfully",
        data: updatedAttendance,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while adding attendance");
  }
});

export default router;
