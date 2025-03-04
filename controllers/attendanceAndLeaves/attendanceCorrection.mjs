import AttendanceModel from "../../model/attendanceModel.mjs";

// Helper function to format time in 12-hour format
const formatTo12Hour = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert hour 0 to 12 in 12-hour format
  return `${String(formattedHours).padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${suffix}`;
};

// Helper function to convert 12-hour time format to 24-hour format
const convert12To24 = (time) => {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }
  return { hours, minutes };
};

// Function to calculate working hours and status
const calculateWorkingHoursAndStatus = (timeInObj, timeOutObj) => {
  const timeInMinutes = timeInObj?.hours * 60 + timeInObj?.minutes;
  const timeOutMinutes = timeOutObj?.hours * 60 + timeOutObj?.minutes;
  const workingMinutes = timeOutMinutes - timeInMinutes;
  const workingHours = workingMinutes / 60;

  let status = "Leave"; // Default status
  if (workingHours >= 7) {
    status = "Present";
  } else if (workingHours >= 5 && workingHours < 7) {
    status = "Half Day";
  }
  return { workingHours, status };
};

const attendanceCorrection = async (req, res, next) => {
  try {
    const { username, timeIn, timeOut } = req.body;

    // Convert time to 12-hour format
    const formattedTimeIn = timeIn ? formatTo12Hour(timeIn) : null;
    const formattedTimeOut = timeOut ? formatTo12Hour(timeOut) : null;

    // Get the current date as a formatted string in "YYYY-MM-DD"
    const date = new Date().toLocaleDateString("en-CA");

    // Find today's attendance record for the user (using string date comparison)
    const attendances = await AttendanceModel.findOne({
      username,
      "attendanceRecords.from": date,
    }).select("attendanceRecords");

    const todayAttendanceEntry = attendances?.attendanceRecords[0];

    // Attendance not found, and timeIn is not provided
    if (!todayAttendanceEntry && !formattedTimeIn) {
      return res.status(400).json({ message: "Punch-in not done" });
    }

    // Attendance not found, timeIn is provided
    if (!todayAttendanceEntry && formattedTimeIn) {
      const newAttendance = {
        from: date,
        to: date,
        type: "Attendance",
        timeIn: formattedTimeIn || "",
        timeOut: formattedTimeOut || "",
        status: "Leave",
        workingHours: 0,
      };

      // Attendance not found, both timeIn and timeOut are provided, calculate working hours and status
      if (formattedTimeOut) {
        const timeInObj = convert12To24(formattedTimeIn);
        const timeOutObj = convert12To24(formattedTimeOut);
        const { workingHours, status } = calculateWorkingHoursAndStatus(
          timeInObj,
          timeOutObj
        );
        newAttendance.status = status;
        newAttendance.workingHours = workingHours;
      }

      const newAttendanceRecord = {
        username: username,
        attendanceRecords: [newAttendance],
      };

      await AttendanceModel.create(newAttendanceRecord);
      return res
        .status(201)
        .json({ message: "Attendance created successfully" });
    }

    // Attendance found and only timeIn is provided
    if (todayAttendanceEntry && formattedTimeIn) {
      await AttendanceModel.updateOne(
        {
          username,
          "attendanceRecords.from": date,
        },
        {
          $set: {
            "attendanceRecords.$.timeIn": formattedTimeIn,
          },
        }
      );

      // Attendance found and both timeIn and timeOut are provided, calculate working hours and status
      if (formattedTimeOut) {
        const timeInObj = convert12To24(formattedTimeIn);
        const timeOutObj = convert12To24(formattedTimeOut);
        const { workingHours, status } = calculateWorkingHoursAndStatus(
          timeInObj,
          timeOutObj
        );

        await AttendanceModel.updateOne(
          {
            username,
            "attendanceRecords.from": date,
          },
          {
            $set: {
              "attendanceRecords.$.timeIn": formattedTimeIn,
              "attendanceRecords.$.timeOut": formattedTimeOut,
              "attendanceRecords.$.workingHours": workingHours,
              "attendanceRecords.$.status": status,
            },
          }
        );
      }

      return res
        .status(200)
        .json({ message: "Attendance updated successfully" });
    }

    // Attendance found and only timeOut is provided
    if (formattedTimeOut) {
      // Attendance found and only timeOut is provided, and timeIn does not exist for the record
      if (!todayAttendanceEntry?.timeIn) {
        return res.status(400).json({ message: "Punch-in not done" });
      }

      // Calculate working hours and status if timeIn exists and timeOut is provided
      const timeInObj = convert12To24(todayAttendanceEntry.timeIn);
      const timeOutObj = convert12To24(formattedTimeOut);

      const { workingHours, status } = calculateWorkingHoursAndStatus(
        timeInObj,
        timeOutObj
      );

      // Update the record with timeOut, working hours, and status
      await AttendanceModel.updateOne(
        {
          username,
          "attendanceRecords.from": date,
        },
        {
          $set: {
            "attendanceRecords.$.timeOut": formattedTimeOut,
            "attendanceRecords.$.workingHours": workingHours,
            "attendanceRecords.$.status": status,
          },
        }
      );

      return res
        .status(200)
        .json({ message: "Attendance updated successfully" });
    }
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default attendanceCorrection;
