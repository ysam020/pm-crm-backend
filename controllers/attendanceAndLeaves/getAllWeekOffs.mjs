import AttendanceModel from "../../model/attendanceModel.mjs";

const getAllWeekOffs = async (req, res, next) => {
  try {
    // Extract month and year from the request params
    const { month_year } = req.params;
    const [year, month] = month_year.split("-").map(Number);

    // Check if the provided month and year are valid
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).send({ message: "Invalid month_year format" });
    }

    // Calculate the start and end dates for the given month and year
    const startDate = new Date(year, month - 1, 1).toLocaleDateString("en-CA");
    const endDate = new Date(
      year,
      month,
      0,
      23,
      59,
      59,
      999
    ).toLocaleDateString("en-CA");

    const attendanceRecords = await AttendanceModel.find({
      "attendance.from": { $gte: startDate, $lte: endDate },
      "attendance.status": "Week Off",
    }).select("username attendanceRecords");

    // Extract the week off records and structure them
    const result = attendanceRecords.flatMap((record) => {
      return record.attendanceRecords
        .filter((entry) => {
          return (
            entry.status === "Week Off" &&
            entry.from >= startDate &&
            entry.from <= endDate
          );
        })
        .map((entry) => ({
          _id: entry._id,
          date: entry.from,
          status: entry.approval_status,
          username: record.username,
        }));
    });

    // Return the list of week off records
    res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getAllWeekOffs;
