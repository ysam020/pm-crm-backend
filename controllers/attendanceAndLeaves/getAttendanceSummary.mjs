import AttendanceModel from "../../model/attendanceModel.mjs";

const getAttendanceSummary = async (req, res, next) => {
  try {
    const username = req.user.username;
    const monthlyPaidLeaves = parseFloat(process.env.MONTHLY_PAID_LEAVES) || 0;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // Get total days in the current month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getDate();

    // Calculate working days assuming 4 week-offs
    const workingDays = totalDaysInMonth - 4;

    // Fetch attendance records for the user
    const attendanceData = await AttendanceModel.findOne(
      { username },
      "attendanceRecords leaveBalance"
    );

    if (!attendanceData || !attendanceData.attendanceRecords) {
      return res.status(200).json({
        workingDays,
        presents: 0,
        leaves: currentDay, // All past days are leaves
        weekOffs: 0,
        paidLeaves: Math.min(currentDay, monthlyPaidLeaves),
        unpaidLeaves: Math.max(0, currentDay - monthlyPaidLeaves),
      });
    }

    // Convert attendance records into a Map for O(1) lookups
    const attendanceMap = new Map(
      attendanceData.attendanceRecords.map((record) => [
        new Date(record.from).toLocaleDateString("en-CA"),
        record.status,
      ])
    );

    // Initialize counters
    let presents = 0,
      leaves = 0,
      weekOffs = 0;

    // Iterate through the month's dates
    for (let day = 1; day <= currentDay; day++) {
      const dateStr = new Date(year, month - 1, day).toLocaleDateString(
        "en-CA"
      );

      const status = attendanceMap.get(dateStr);

      if (status === "Present") presents++;
      else if (status === "Week Off") weekOffs++;
      else leaves++;
    }

    // Calculate paid and unpaid leaves
    const paidLeaves = Math.min(leaves, monthlyPaidLeaves);
    const unpaidLeaves = Math.max(0, leaves - monthlyPaidLeaves);

    const result = {
      workingDays,
      presents,
      leaves,
      weekOffs,
      paidLeaves,
      unpaidLeaves,
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getAttendanceSummary;
