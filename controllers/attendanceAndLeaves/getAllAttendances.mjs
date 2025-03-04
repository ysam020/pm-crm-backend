import AttendanceModel from "../../model/attendanceModel.mjs";

const getAllAttendances = async (req, res, next) => {
  try {
    const { year, month } = req.params;

    // Convert inputs to integers
    const queryYear = parseInt(year);
    const queryMonth = parseInt(month);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Determine the last day of the requested month
    const lastDay = new Date(queryYear, queryMonth, 0).getDate();
    const daysToInclude =
      queryYear === currentYear && queryMonth === currentMonth
        ? currentDay
        : lastDay;

    // Build date range (as strings) for the requested month
    const dateRange = Array.from({ length: daysToInclude }, (_, i) =>
      new Date(queryYear, queryMonth - 1, i + 1).toLocaleDateString("en-CA")
    );

    // Retrieve attendance records from the database
    const attendances = await AttendanceModel.find({}).select(
      "username attendanceRecords"
    );

    const result = [];

    // Process each user's attendance
    for (const attendance of attendances) {
      let presents = 0;
      let leaves = 0;
      let halfDays = 0;
      let weekOffs = 0;

      // Prepare a map for quick lookup of attendance records by date
      const recordMap = new Map(
        attendance.attendanceRecords.map((record) => [
          new Date(record.from).toLocaleDateString("en-CA"), // Normalize the date key
          record,
        ])
      );

      // Evaluate each day in the range
      for (const date of dateRange) {
        const existingRecord = recordMap.get(date);

        if (existingRecord) {
          // Increment based on status
          switch (existingRecord.status) {
            case "Present":
              presents++;
              break;
            case "Half Day":
              halfDays++;
              break;
            case "Week Off":
              weekOffs++;
              break;
            case "Leave":
              leaves++;
              break;
            default:
              leaves++; // Unknown status treated as leave
              break;
          }
        } else {
          // If no record found, treat as leave
          leaves++;
        }
      }

      // Push the compiled data for this user
      result.push({
        username: attendance.username,
        presents,
        leaves,
        halfDays,
        weekOffs,
      });
    }

    // Return the results
    return res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getAllAttendances;
