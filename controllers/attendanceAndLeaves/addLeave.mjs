import AttendanceModel from "../../model/attendanceModel.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import addNotification from "../../utils/addNotification.mjs";
import convertDateFormat from "../../utils/convertDateFormat.mjs";
import moment from "moment";
import mongoose from "mongoose";

const addLeave = async (req, res, next) => {
  try {
    const username = req.user.username;
    const monthlyPaidLeaves = process.env.MONTHLY_PAID_LEAVES;

    const { from, to, reason, sick_leave, medical_certificate } = req.body;
    const recordId = new mongoose.Types.ObjectId();

    const fromDate = moment(from, "YYYY-MM-DD");
    const toDate = moment(to, "YYYY-MM-DD");
    if (!fromDate.isValid() || !toDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const attendance = await AttendanceModel.findOne({
      username,
    });

    if (!attendance) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check for overlapping leave dates
    const hasOverlappingLeave = attendance.attendanceRecords.some((record) => {
      if (record.type !== "Leave") return false;

      const recordFrom = moment(record.from, "YYYY-MM-DD");
      const recordTo = moment(record.to, "YYYY-MM-DD");

      // Check if the date ranges overlap
      const isOverlapping =
        (fromDate >= recordFrom && fromDate <= recordTo) || // New start date falls within existing leave
        (toDate >= recordFrom && toDate <= recordTo) || // New end date falls within existing leave
        (fromDate <= recordFrom && toDate >= recordTo); // New leave completely encompasses existing leave

      return isOverlapping;
    });

    if (hasOverlappingLeave) {
      return res.status(400).json({
        message:
          "Leave already applied for this time range or overlapping dates.",
      });
    }

    // Calculate days in each month
    const monthlyDays = {};
    let currentDate = fromDate.clone();

    while (currentDate <= toDate) {
      const monthKey = `${currentDate.year()}-${currentDate.month() + 1}`;
      monthlyDays[monthKey] = (monthlyDays[monthKey] || 0) + 1;
      currentDate.add(1, "days");
    }

    const calculateLeaveBalance = (existingTotal = 0, daysInMonth) => {
      const totalLeaves = existingTotal + daysInMonth;
      return {
        totalLeaves,
        paidLeaves: Math.min(totalLeaves, monthlyPaidLeaves),
        unpaidLeaves: Math.max(0, totalLeaves - monthlyPaidLeaves),
      };
    };

    // Update leave balance for each affected month
    for (const monthKey of Object.keys(monthlyDays)) {
      const [year, month] = monthKey.split("-").map(Number);
      const daysInThisMonth = monthlyDays[monthKey];

      let leaveBalanceRecord = attendance.leaveBalance.find(
        (lb) => lb.month === month && lb.year === year
      );

      if (!leaveBalanceRecord) {
        const balance = calculateLeaveBalance(0, daysInThisMonth);
        attendance.leaveBalance.push({
          month,
          year,
          ...balance,
        });
      } else {
        const balance = calculateLeaveBalance(
          leaveBalanceRecord.totalLeaves,
          daysInThisMonth
        );
        Object.assign(leaveBalanceRecord, balance);
      }
    }

    const leaveRecord = {
      _id: recordId,
      from,
      to,
      reason,
      sick_leave,
      medical_certificate,
      type: "Leave",
      status: "Leave",
      approval_status: "Pending",
      appliedOn: moment().format("YYYY-MM-DD"),
    };

    // Add new record
    attendance.attendanceRecords.push(leaveRecord);
    await attendance.save();

    const io = req.app.get("io");

    await addNotification(
      io,
      req.user.department,
      "Leave Request",
      `${username} has applied for leave from ${convertDateFormat(
        from
      )} to ${convertDateFormat(to)}.`,
      req.user.rank,
      recordId
    );

    await sendDepartmentPushNotifications(
      username,
      req.user.department,
      req.user.rank,
      {
        notification: {
          title: "Leave Request",
          body: `${username} has applied for leave from ${convertDateFormat(
            from
          )} to ${convertDateFormat(to)}.`,
          image:
            "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
        },
      }
    );

    res.status(200).json({
      message: "Leave added successfully.",
      leaveBalance: attendance.leaveBalance,
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export default addLeave;
