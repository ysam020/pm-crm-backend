import AttendanceModel from "../../model/attendanceModel.mjs";
import haversine from "haversine-distance";
import dotenv from "dotenv";

dotenv.config();

const addAttendance = async (req, res, next) => {
  try {
    const { field, latitude, longitude } = req.body;

    if (!["timeIn", "timeOut"].includes(field)) {
      return res
        .status(400)
        .send("Invalid field value. Must be 'timeIn' or 'timeOut'");
    }

    const OFFICE_LOCATION = {
      latitude: process.env.LATITUDE,
      longitude: process.env.LONGITUDE,
    };

    if (latitude !== null && longitude !== null) {
      // Calculate distance using haversine formula
      const userLocation = { latitude, longitude };
      const distance = haversine(OFFICE_LOCATION, userLocation);
      if (distance > 100) {
        return res.status(400).json({ message: "Not in office" });
      }
    }

    const username = req.user.username;

    const date = new Date().toLocaleDateString("en-CA");
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    // Check if an attendance entry exists for the current date
    const existingAttendance = await AttendanceModel.findOne({
      username,
      "attendanceRecords.from": date,
      "attendanceRecords.to": date,
    });

    const calculateStatus = (timeIn, timeOut) => {
      const timeInDate = new Date(`${date} ${timeIn}`);
      const timeOutDate = new Date(`${date} ${timeOut}`);
      const durationInHours = (timeOutDate - timeInDate) / (1000 * 60 * 60); // Convert milliseconds to hours

      if (durationInHours >= 7) return "Present";
      if (durationInHours >= 5) return "Half Day";
      return "Leave";
    };

    if (existingAttendance) {
      const updateFields = {
        [`attendanceRecords.$.${field}`]: time,
        "attendanceRecords.$.type": "Attendance", // Always set type to "Attendance"
      };

      // Update status dynamically
      if (field === "timeOut") {
        const timeIn = existingAttendance.attendanceRecords.find(
          (entry) => entry.from === date
        )?.timeIn;

        if (timeIn) {
          const status = calculateStatus(timeIn, time);
          updateFields["attendanceRecords.$.status"] = status;
        }
      } else {
        // Default status to "Leave" if `timeOut` is not provided
        updateFields["attendanceRecords.$.status"] = "Leave";
      }

      await AttendanceModel.updateOne(
        {
          username,
          "attendanceRecords.from": date,
          "attendanceRecords.to": date,
        },
        {
          $set: updateFields,
        }
      );

      return res.status(200).json({ message: `Updated successfully` });
    } else {
      // Prepare a new attendance object
      const newAttendance = {
        from: date,
        to: date,
        type: "Attendance",
        status: "Leave", // Default to Leave if timeOut is not available
        [field]: time,
      };

      // If adding `timeOut` directly, throw an error since `timeIn` is required first
      if (field === "timeOut") {
        return res
          .status(400)
          .json({ error: "Cannot update timeOut without existing timeIn" });
      }

      const updatedAttendance = await AttendanceModel.findOneAndUpdate(
        { username },
        {
          $push: { attendanceRecords: newAttendance },
        },
        { new: true, upsert: true }
      );

      return res.status(201).json({
        message: `Added successfully`,
        data: updatedAttendance,
      });
    }
  } catch (error) {
    next(error);
    res.status(500).send("An error occurred while adding attendance");
  }
};

export default addAttendance;
