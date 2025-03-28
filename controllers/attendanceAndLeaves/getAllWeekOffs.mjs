import AttendanceModel from "../../model/attendanceModel.mjs";

const getAllWeekOffs = async (req, res, next) => {
  try {
    // Extract month and year from request params
    const { month_year } = req.params;
    const [year, month] = month_year.split("-").map(Number);

    // Validate month and year
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).send({ message: "Invalid month_year format" });
    }

    // Calculate start and end dates
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Convert dates to "YYYY-MM-DD" format for efficient comparisons
    const startDateStr = startDate.toLocaleDateString("en-CA");
    const endDateStr = endDate.toLocaleDateString("en-CA");

    // Generate date range as a Set (O(1) lookups)
    const dateRangeSet = new Set(
      Array.from({ length: endDate.getDate() }, (_, i) =>
        new Date(year, month - 1, i + 1).toLocaleDateString("en-CA")
      )
    );

    // Query attendance data
    const attendanceRecords = await AttendanceModel.find(
      {
        "attendanceRecords.status": "Week Off",
        "attendanceRecords.from": { $gte: startDateStr, $lte: endDateStr },
      },
      "username attendanceRecords"
    );

    const result = [];

    // Process attendance records
    for (const record of attendanceRecords) {
      for (const entry of record.attendanceRecords) {
        const dateStr = new Date(entry.from).toLocaleDateString("en-CA");

        // Only process records within the date range
        if (entry.status === "Week Off" && dateRangeSet.has(dateStr)) {
          result.push({
            _id: entry._id,
            date: entry.from,
            status: entry.approval_status,
            username: record.username,
          });
        }
      }
    }

    // Return the structured result
    return res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getAllWeekOffs;
