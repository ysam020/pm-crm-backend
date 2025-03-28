import AttendanceModel from "../../model/attendanceModel.mjs";

const getUserLeaves = async (req, res, next) => {
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

    // Use MongoDB's `$filter` operator to retrieve only relevant records
    const attendances = await AttendanceModel.findOne(
      {
        username,
      },
      {
        username: 1,
        attendanceRecords: {
          $filter: {
            input: "$attendanceRecords",
            as: "record",
            cond: {
              $and: [
                { $eq: ["$$record.status", "Leave"] },
                { $gte: ["$$record.from", startDate] },
                { $lte: ["$$record.from", endDate] },
              ],
            },
          },
        },
      }
    );

    // Return an empty array if no records found
    if (!attendances || attendances.attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No leave records found" });
    }

    // Construct the response
    const result = attendances.attendanceRecords.map((record) => ({
      from: record.from,
      to: record.to,
      status: record.approval_status,
      reason: record.reason || "",
      medical_certificate: record.medical_certificate || "",
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

export default getUserLeaves;
