import AttendanceModel from "../../model/attendanceModel.mjs";
import NotificationModel from "../../model/notificationModel.mjs";
import moment from "moment";

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { _id, status, username } = req.body;
    const monthlyPaidLeaves = process.env.MONTHLY_PAID_LEAVES;

    if (!_id || !status || !username) {
      return res.status(400).send({
        error: "Missing required fields: _id, status, or username",
      });
    }

    // Map input status to DB status
    const statusMapping = {
      Approve: "Approved",
      Reject: "Rejected",
    };

    const dbStatus = statusMapping[status];
    if (!dbStatus) {
      return res.status(400).send({ error: "Invalid status value" });
    }

    const attendance = await AttendanceModel.findOne({
      username,
      "attendanceRecords._id": _id,
    });

    if (!attendance) {
      return res.status(404).send({ error: "Attendance record not found" });
    }

    // Find the specific leave record
    const leaveRecord = attendance.attendanceRecords.find(
      (record) => record._id.toString() === _id
    );

    if (dbStatus === "Rejected") {
      // Recalculate leave balance only for rejected leaves
      const fromDate = moment(leaveRecord.from, "YYYY-MM-DD");
      const toDate = moment(leaveRecord.to, "YYYY-MM-DD");

      // Calculate days in each month that need to be subtracted
      const monthlyDays = {};
      let currentDate = fromDate.clone();

      while (currentDate <= toDate) {
        const monthKey = `${currentDate.year()}-${currentDate.month() + 1}`;
        monthlyDays[monthKey] = (monthlyDays[monthKey] || 0) + 1;
        currentDate.add(1, "days");
      }

      // Update leave balance for each affected month
      for (const monthKey of Object.keys(monthlyDays)) {
        const [year, month] = monthKey.split("-").map(Number);
        const daysInThisMonth = monthlyDays[monthKey];

        let leaveBalanceRecord = attendance.leaveBalance.find(
          (lb) => lb.month === month && lb.year === year
        );

        if (leaveBalanceRecord) {
          // Subtract the days from the total leaves
          const newTotalLeaves = Math.max(
            0,
            leaveBalanceRecord.totalLeaves - daysInThisMonth
          );

          // Recalculate paid and unpaid leaves
          leaveBalanceRecord.totalLeaves = newTotalLeaves;
          leaveBalanceRecord.paidLeaves = Math.min(
            newTotalLeaves,
            monthlyPaidLeaves
          );
          leaveBalanceRecord.unpaidLeaves = Math.max(
            0,
            newTotalLeaves - monthlyPaidLeaves
          );

          // Remove the leave balance record if all values are 0
          if (
            leaveBalanceRecord.totalLeaves === 0 &&
            leaveBalanceRecord.paidLeaves === 0 &&
            leaveBalanceRecord.unpaidLeaves === 0
          ) {
            attendance.leaveBalance = attendance.leaveBalance.filter(
              (lb) => !(lb.month === month && lb.year === year)
            );
          }
        }
      }

      // Remove the rejected leave record from attendanceRecords
      attendance.attendanceRecords = attendance.attendanceRecords.filter(
        (record) => record._id.toString() !== _id
      );
    } else {
      // For approved leaves, just update the status
      const leaveIndex = attendance.attendanceRecords.findIndex(
        (record) => record._id.toString() === _id
      );
      attendance.attendanceRecords[leaveIndex].approval_status = dbStatus;
    }

    // Save the updated attendance record
    await attendance.save();

    await NotificationModel.updateOne(
      {
        "notifications._id": _id,
      },
      {
        $set: {
          "notifications.$.deleted": true,
        },
      }
    );

    res.status(200).send({
      message: "Status updated successfully",
      leaveBalance: attendance.leaveBalance,
    });
  } catch (error) {
    next(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

export default updateLeaveStatus;
