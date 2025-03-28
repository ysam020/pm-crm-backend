import AttendanceModel from "../../model/attendanceModel.mjs";

const getAttendances = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { month, year } = req.params;

    // Validate month and year
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
        ? currentDate.getDate()
        : daysInMonth;

    // Generate date range as a Set for O(1) lookups
    const dateRangeSet = new Set(
      Array.from({ length: endDay }, (_, i) =>
        new Date(queriedYear, queriedMonth - 1, i + 1).toLocaleDateString(
          "en-CA"
        )
      )
    );

    // Fetch attendance records for the user
    const attendanceRecord = await AttendanceModel.findOne(
      { username },
      "attendanceRecords"
    );

    if (!attendanceRecord) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    // Convert attendanceRecords into a HashMap for O(1) lookups
    const attendanceMap = new Map(
      attendanceRecord.attendanceRecords.map((record) => [
        new Date(record.from).toLocaleDateString("en-CA"),
        record,
      ])
    );

    // Generate the attendance report
    const report = Array.from(dateRangeSet).map((date) => {
      const record = attendanceMap.get(date);

      return record
        ? {
            date,
            status: record.status || "Pending",
            timeIn: record.timeIn || "",
            timeOut: record.timeOut || "",
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
    next(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getAttendances;
