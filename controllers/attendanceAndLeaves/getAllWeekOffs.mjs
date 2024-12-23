import AttendanceModel from "../../model/attendanceModel.mjs";

const getAllWeekOffs = async (req, res) => {
  try {
    // Extract month and year from request params
    const { month_year } = req.params;
    const [month, year] = month_year.split("-").map(Number);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).send({ message: "Invalid month_year format" });
    }

    // Calculate the start and end dates for the given month and year
    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the month

    // Find all attendance records with "Week Off" type for the given date range
    const attendanceRecords = await AttendanceModel.find({
      "attendance.date": { $gte: startDate, $lte: endDate },
      "attendance.type": "Week Off", // Filter by type
    });

    // Extract and structure the relevant data
    const result = attendanceRecords.map((record) => {
      const weekOffDates = record.attendance
        .filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            entryDate >= startDate &&
            entryDate <= endDate &&
            entry.type === "Week Off"
          );
        })
        .map((entry) => ({
          _id: entry._id, // Include the _id field
          date: entry.date,
          status: entry.status,
          username: record.username,
        }));

      return weekOffDates;
    });

    // Flatten and clean up the result
    const flattenedResult = result.flat();

    res.status(200).json(flattenedResult);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getAllWeekOffs;
