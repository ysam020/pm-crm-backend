import express from "express";
import NotificationModel from "../model/notificationModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.delete(
  "/api/delete-notification/:_id",
  verifySession,
  async (req, res) => {
    try {
      const { _id } = req.params; // Notification ID to delete
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const department = decoded.department;

      // Find the notification and set deleted = true
      const result = await NotificationModel.updateOne(
        { department, "notifications._id": _id },
        { $set: { "notifications.$.deleted": true } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).send({
          message:
            "Notification not found or you don't have permission to delete it.",
        });
      }

      res.status(200).send({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
