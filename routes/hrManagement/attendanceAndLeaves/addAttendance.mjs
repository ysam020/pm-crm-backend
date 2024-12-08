import express from "express";
import verifySession from "../../../middlewares/verifySession.mjs";
import AttendanceModel from "../../../model/attendanceModel.mjs";
import jwt from "jsonwebtoken";

// Haversine Formula to calculate distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
  const φ2 = (lat2 * Math.PI) / 180; // Convert latitude to radians
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitudes
  const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Difference in longitudes

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const router = express.Router();

router.post("/api/add-attendance", verifySession, async (req, res) => {
  try {
    const { field, latitude, longitude } = req.body;

    if (!["timeIn", "timeOut"].includes(field)) {
      return res
        .status(400)
        .send("Invalid field value. Must be 'timeIn' or 'timeOut'");
    }

    // Office coordinates from environment variables
    const officeLatitude = parseFloat(process.env.LATITUDE);
    const officeLongitude = parseFloat(process.env.LONGITUDE);

    // Calculate the distance from the office
    const distance = haversineDistance(
      officeLatitude,
      officeLongitude,
      latitude,
      longitude
    );

    // If the distance is greater than 100 meters, reject the request
    if (distance > 100) {
      return res.status(400).json({ message: "Not in office" });
    }

    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Helper function to get the current time in 24-hour format
    const getCurrentTime = () => new Date(); 

    // Get the current date (normalized to midnight of local date)
    const currentDate = new Date();
    const localDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Get the current time
    const currentTime = getCurrentTime();

    // Check if an attendance entry exists for the current date
    const existingAttendance = await AttendanceModel.findOne({
      username,
      "attendance.date": localDate,
    });

    if (existingAttendance) {
      const updateFields = {
        [`attendance.$.${field}`]: currentTime,
      };

      // If updating timeOut, calculate the type
      if (field === "timeOut") {
        const timeIn = existingAttendance.attendance.find(
          (entry) => entry.date.getTime() === localDate.getTime()
        )?.timeIn;

        if (timeIn) {
          const timeInDate = new Date(timeIn);
          const durationInHours = (currentTime - timeInDate) / (1000 * 60 * 60); // Convert milliseconds to hours

          let type;
          if (durationInHours >= 7) {
            type = "Present";
          } else if (durationInHours >= 5) {
            type = "Half Day";
          } else {
            type = "Leave";
          }

          // Include type update
          updateFields["attendance.$.type"] = type;
        }
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

      res.status(200).json({ message: `Updated successfully` });
    } else {
      // Prepare a new attendance object
      const newAttendance = {
        date: localDate,
        [field]: currentTime,
      };

      // If adding timeOut, set the type based on duration
      if (field === "timeOut") {
        res
          .status(400)
          .send({ error: "Cannot update timeOut without existing timeIn" });
        return;
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
        message: `Updated successfully`,
        data: updatedAttendance,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while adding attendance");
  }
});

export default router;
