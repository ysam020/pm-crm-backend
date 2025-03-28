import AttendanceModel from "../../model/attendanceModel.mjs";

const getOwnWeekOffs = async (req, res, next) => {
  try {
    const { month_year } = req.params;
    const [year, month] = month_year.split("-").map(Number);
    const username = req.user.username;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month_year format" });
    }

    // Start and end dates for the requested month
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]; // YYYY-MM-DD
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // YYYY-MM-DD

    // Query MongoDB using `$filter` to optimize fetching
    const attendance = await AttendanceModel.findOne(
      { username },
      {
        username: 1,
        attendanceRecords: {
          $filter: {
            input: "$attendanceRecords",
            as: "record",
            cond: {
              $and: [
                { $eq: ["$$record.status", "Week Off"] },
                { $gte: ["$$record.from", startDate] },
                { $lte: ["$$record.from", endDate] },
              ],
            },
          },
        },
      }
    );

    if (!attendance || attendance.attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No week offs found" });
    }

    // Format the response
    const result = attendance.attendanceRecords.map((record) => ({
      from: record.from,
      status: record.approval_status,
    }));

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
