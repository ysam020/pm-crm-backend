import AttendanceModel from "../../model/attendanceModel.mjs";

const attendanceCorrection = async (req, res) => {
  try {
    const { username, timeIn, timeOut } = req.body;

    // Helper function to convert time (HH:mm) to a Date object with today's date
    const convertToDateTime = (time) => {
      if (!time) return null;
      const [hours, minutes] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds
      return date;
    };

    const timeInDate = timeIn ? convertToDateTime(timeIn) : null;
    const timeOutDate = timeOut ? convertToDateTime(timeOut) : null;

    // Get the current date normalized to midnight
    const currentDate = new Date();
    const localDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Prepare the update object conditionally
    const updateFields = {};
    if (timeInDate) {
      updateFields["attendance.$.timeIn"] = timeInDate;
    }
    if (timeOutDate) {
      updateFields["attendance.$.timeOut"] = timeOutDate;
    }

    // Find today's attendance record for the user
    const attendanceRecord = await AttendanceModel.findOne({
      username,
      "attendance.date": localDate,
    });

    if (!attendanceRecord) {
      // If no record is found, return an error
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Find today's specific entry in the attendance array
    const todayAttendanceEntry = attendanceRecord.attendance.find(
      (entry) =>
        new Date(entry.date).toDateString() === localDate.toDateString()
    );

    if (timeOutDate && !todayAttendanceEntry.timeIn) {
      // Check if timeIn is not recorded for today's date before updating timeOut
      return res.status(400).json({ message: "Punch-in not done" });
    }

    // Update attendance record if timeOut is provided
    if (timeOutDate) {
      const timeDifference =
        (timeOutDate - todayAttendanceEntry.timeIn) / (1000 * 60 * 60); // Difference in hours

      // Classify attendance based on time difference
      let type = "Leave"; // Default type
      if (timeDifference >= 7) {
        type = "Present";
      } else if (timeDifference >= 5 && timeDifference < 7) {
        type = "Half Day";
      }

      // Update the attendance type and other fields
      await AttendanceModel.updateOne(
        {
          username,
          "attendance.date": localDate,
        },
        {
          $set: {
            "attendance.$.timeOut": timeOutDate,
            "attendance.$.type": type,
          },
        }
      );
      return res
        .status(200)
        .json({ message: "Attendance updated successfully" });
    }

    // If no existing record, create a new attendance record
    if (!todayAttendanceEntry) {
      const newAttendance = {
        date: localDate,
        timeIn: timeInDate,
        timeOut: timeOutDate,
        type: "Leave", // Default type
      };

      if (timeInDate && timeOutDate) {
        const timeDifference = (timeOutDate - timeInDate) / (1000 * 60 * 60); // Difference in hours
        if (timeDifference >= 7) {
          newAttendance.type = "Present";
        } else if (timeDifference >= 5 && timeDifference < 7) {
          newAttendance.type = "Half Day";
        }
      }

      await AttendanceModel.updateOne(
        { username },
        {
          $push: { attendance: newAttendance },
        },
        { upsert: true }
      );

      return res
        .status(201)
        .json({ message: "Attendance created successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default attendanceCorrection;
