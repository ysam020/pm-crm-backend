import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.put("/api/update-leave-status", verifySession, async (req, res) => {
  try {
    const { _id, status } = req.body;

    if (!_id || !status) {
      return res
        .status(400)
        .send({ error: "Missing required fields _id or status" });
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

    // Update the status of the matching leave object
    const updatedLeave = await UserModel.findOneAndUpdate(
      { "leaves.leaves._id": _id }, // Match the nested _id within the `leaves` array
      { $set: { "leaves.$[].leaves.$[leave].status": dbStatus } }, // Use array filters to update the matching leave's status
      {
        new: true, // Return the updated document
        arrayFilters: [{ "leave._id": _id }], // Filter to apply update to the correct nested leave
      }
    );

    if (!updatedLeave) {
      return res.status(404).send({ error: "Leave not found" });
    }

    res
      .status(200)
      .send({ message: "Status updated successfully", updatedLeave });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
