import AttendanceModel from "../../model/attendanceModel.mjs";

const updateWeekOffStatus = async (req, res) => {
  try {
    const { _id, status, username } = req.body;

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

    if (dbStatus === "Rejected") {
      // Remove the rejected week off record from attendanceRecords
      attendance.attendanceRecords = attendance.attendanceRecords.filter(
        (record) => record._id.toString() !== _id
      );
    } else {
      // For approved week offs, just update the status
      const recordIndex = attendance.attendanceRecords.findIndex(
        (record) => record._id.toString() === _id
      );
      attendance.attendanceRecords[recordIndex].approval_status = dbStatus;
    }

    // Save the updated attendance record
    await attendance.save();

    res.status(200).send({
      message:
        status === "Reject"
          ? "Week off rejected and removed successfully"
          : "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating week off status:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

export default updateWeekOffStatus;
