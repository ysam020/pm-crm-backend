import express from "express";
import verifySession from "../../../middlewares/verifySession.mjs";
import AttendanceModel from "../../../model/attendanceModel.mjs";

const router = express.Router();

router.put("/api/update-week-off-status", verifySession, async (req, res) => {
  try {
    const { _id, status } = req.body;

    // Validate input
    if (!_id || !status) {
      return res
        .status(400)
        .send({ error: "Missing required fields _id or status" });
    }

    // Map input status to database status values
    const statusMapping = {
      Approve: "Approved",
      Reject: "Rejected",
      Withdraw: "Withdrawn",
    };

    const dbStatus = statusMapping[status];
    if (!dbStatus) {
      return res.status(400).send({ error: "Invalid status value" });
    }

    // Update the attendance status
    const updatedAttendance = await AttendanceModel.findOneAndUpdate(
      { "attendance._id": _id }, // Match the specific attendance entry
      { $set: { "attendance.$.status": dbStatus } }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedAttendance) {
      return res
        .status(404)
        .send({ error: "Attendance record not found for the provided _id" });
    }

    res.status(200).send({
      message: "Week Off status updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
