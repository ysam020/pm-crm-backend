import AttendanceModel from "../../model/attendanceModel.mjs";

const getAllUsersLeaves = async (req, res, next) => {
  try {
    const { month_year } = req.params;
    const [year, month] = month_year.split("-").map(Number);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month_year format" });
    }

    // Calculate start and end dates for the requested month
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]; // YYYY-MM-DD
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // YYYY-MM-DD

    // Query to fetch all users who have "Leave" status within the date range
    const attendances = await AttendanceModel.find({
      "attendanceRecords.from": { $gte: startDate, $lte: endDate },
      "attendanceRecords.status": "Leave",
    }).select("username attendanceRecords");

    // Use a `Map` to group records by user
    const leaveMap = new Map();

    attendances.forEach((user) => {
      const filteredRecords = user.attendanceRecords.filter(
        (record) =>
          record.status === "Leave" &&
          record.from >= startDate &&
          record.from <= endDate
      );

      if (filteredRecords.length > 0) {
        if (!leaveMap.has(user.username)) {
          leaveMap.set(user.username, []);
        }

        leaveMap.get(user.username).push(
          ...filteredRecords.map((record) => ({
            _id: record._id,
            username: user.username,
            from: record.from,
            to: record.to,
            status: record.approval_status,
            reason: record.reason || "",
            medical_certificate: record.medical_certificate || "",
          }))
        );
      }
    });

    // Convert Map values to an array
    const result = Array.from(leaveMap.values()).flat();

    res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getAllUsersLeaves;
