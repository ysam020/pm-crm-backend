import AttendanceModel from "../../model/attendanceModel.mjs";
import NotificationModel from "../../model/notificationModel.mjs";

const updateWeekOffStatus = async (req, res, next) => {
  try {
    const { _id, status, username } = req.body;

    if (!_id || !status || !username) {
      return res.status(400).send({
        message: "Missing required fields: _id, status, or username",
      });
    }

    // Map input status to DB status
    const statusMapping = {
      Approve: "Approved",
      Reject: "Rejected",
    };

    const dbStatus = statusMapping[status];
    if (!dbStatus) {
      return res.status(400).send({ message: "Invalid status value" });
    }

    const attendance = await AttendanceModel.findOne({
      username,
      "attendanceRecords._id": _id,
    });

    if (!attendance) {
      return res.status(404).send({ message: "Attendance record not found" });
    }

    // Find and update the notification
    const notification = await NotificationModel.findOne({
      "notifications._id": _id, // Match the notification with the same _id
    });

    if (!notification) {
      return res.status(404).send({ message: "Notification not found" });
    }

    if (dbStatus === "Rejected") {
      // Remove the rejected week off record from attendanceRecords
      attendance.attendanceRecords = attendance.attendanceRecords.filter(
        (record) => record._id.toString() !== _id
      );
    } else {
      const recordIndex = attendance.attendanceRecords.findIndex(
        (record) => record._id.toString() === _id
      );
      attendance.attendanceRecords[recordIndex].approval_status = dbStatus;
    }

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

    // Save the updated attendance record
    await attendance.save();

    res.status(200).send({
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default updateWeekOffStatus;
