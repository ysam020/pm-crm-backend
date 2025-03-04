import AttendanceModel from "../../model/attendanceModel.mjs";

const getAttendanceSummary = async (req, res, next) => {
  try {
    const username = req.user.username;

    const monthlyPaidLeaves = process.env.MONTHLY_PAID_LEAVES;

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    // Start and end dates for the month
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

    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const workingDays = totalDaysInMonth - 4; // Assuming 4 week-offs

    // Fetch attendance records for the user
    const attendances = await AttendanceModel.findOne({
      username,
      "attendanceRecords.from": { $gte: startDate, $lte: endDate },
    }).select("attendanceRecords leaveBalance");

    const currentDay = new Date().getDate();

    // Initialize counters
    let presents = 0;
    let leaves = 0;
    let weekOffs = 0;

    // Check if attendance data exists
    if (attendances && attendances.attendanceRecords) {
      // Generate the full date range for the entire month
      const fullMonthDateRange = Array.from(
        { length: totalDaysInMonth },
        (_, i) => new Date(year, month - 1, i + 1).toLocaleDateString("en-CA")
      );

      for (const date of fullMonthDateRange) {
        const record = attendances?.attendanceRecords.find(
          (item) => item.from === date
        );

        if (record) {
          switch (record.status) {
            case "Present":
              presents++;
              break;
            case "Week Off":
              weekOffs++;
              break;
            case "Leave":
              leaves++;
              break;
            default:
              break;
          }
        } else {
          // Dates beyond the current day won't count as leaves
          if (new Date(date) <= new Date()) {
            leaves++;
          }
        }
      }
    } else {
      // No attendance data at all, assume all dates up to today are leaves
      leaves = currentDay;
    }

    const paidLeaves = leaves <= monthlyPaidLeaves ? leaves : monthlyPaidLeaves;
    const unpaidLeaves =
      leaves > monthlyPaidLeaves ? leaves - monthlyPaidLeaves : 0;

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
