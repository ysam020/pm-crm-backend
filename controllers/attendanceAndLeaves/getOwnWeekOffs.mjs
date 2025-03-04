import AttendanceModel from "../../model/attendanceModel.mjs";

const getOwnWeekOffs = async (req, res, next) => {
  const { month_year } = req.params;

  try {
    const [year, month] = month_year.split("-").map(Number);
    const username = req.user.username;

    // Start and end dates for the requested month
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

    // Query to fetch users with status "Leave" in the given month/year
    const attendances = await AttendanceModel.find({
      username,
      attendanceRecords: {
        $elemMatch: {
          from: { $gte: startDate, $lte: endDate },
          status: "Week Off",
        },
      },
    }).select("username attendanceRecords");

    // Flatten and restructure the result
    const result = attendances.flatMap((user) =>
      user.attendanceRecords
        .filter(
          (record) =>
            record.status === "Week Off" &&
            record.from >= startDate &&
            record.from <= endDate
        )
        .map((record) => ({
          from: record.from,
          status: record.approval_status,
        }))
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getOwnWeekOffs;
