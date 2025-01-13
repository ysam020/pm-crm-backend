import AttendanceModel from "../../model/attendanceModel.mjs";
import jwt from "jsonwebtoken";

const getAttendances = async (req, res) => {
  try {
    // Extract and verify the token
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const { month, year } = req.params;

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).send({ message: "Invalid month or year" });
    }

    const queriedMonth = parseInt(month, 10);
    const queriedYear = parseInt(year, 10);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Determine the number of days in the queried month
    const daysInMonth = new Date(queriedYear, queriedMonth, 0).getDate();

    const endDay =
      queriedYear === currentYear && queriedMonth === currentMonth
        ? currentDate.getDate() // Only include dates up to today for the current month
        : daysInMonth; // Include the entire month for past/future months

    // Build the range of dates
    const dateRange = [];
    for (let i = 1; i <= endDay; i++) {
      const date = new Date(
        queriedYear,
        queriedMonth - 1,
        i
      ).toLocaleDateString("en-CA");
      dateRange.push(date);
    }

    // Fetch attendance records for the user
    const attendanceRecords = await AttendanceModel.findOne({
      username,
    }).select("attendanceRecords");

    if (!attendanceRecords) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    // Prepare the attendance report
    const report = dateRange.map((date) => {
      const recordForDate = attendanceRecords.attendanceRecords.find(
        (record) => record.from === date
      );

      return recordForDate
        ? {
            date,
            status: recordForDate.status || "Pending",
            timeIn: recordForDate.timeIn || "",
            timeOut: recordForDate.timeOut || "",
          }
        : {
            date,
            status: "Leave",
            timeIn: "",
            timeOut: "",
          };
    });

    // Respond with the report
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getAttendances;
