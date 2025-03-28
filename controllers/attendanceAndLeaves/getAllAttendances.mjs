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

    // Convert dateRange to a Set for O(1) lookup
    const dateRangeSet = new Set(
      Array.from({ length: daysToInclude }, (_, i) =>
        new Date(queryYear, queryMonth - 1, i + 1).toLocaleDateString("en-CA")
      )
    );

    // Retrieve only required fields from database
    const attendances = await AttendanceModel.find(
      {},
      "username attendanceRecords"
    );

    const result = [];

    for (const attendance of attendances) {
      let presents = 0;
      let leaves = 0;
      let halfDays = 0;
      let weekOffs = 0;

      // Use Object.create(null) instead of Map for faster lookups
      const recordMap = Object.create(null);
      for (const record of attendance.attendanceRecords) {
        const dateKey = new Date(record.from).toLocaleDateString("en-CA");
        if (dateRangeSet.has(dateKey)) {
          recordMap[dateKey] = record.status;
        }
      }

      // Iterate over dateRangeSet
      for (const date of dateRangeSet) {
        const status = recordMap[date] || "Leave"; // Default to Leave if not present

        switch (status) {
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
          default:
            leaves++;
            break;
        }
      }

      result.push({
        username: attendance.username,
        presents,
        leaves,
        halfDays,
        weekOffs,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getAllAttendances;
