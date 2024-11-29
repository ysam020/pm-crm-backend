import express from "express";
import NotificationModel from "../../model/notificationModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/get-notifications", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Fetch the user's notifications with deleted = false
    const userNotifications = await NotificationModel.findOne(
      { username },
      { notifications: { $elemMatch: { deleted: false } } } // Match notifications where deleted is false
    );

    if (!userNotifications) {
      return res
        .status(404)
        .send({ message: "No notifications found for the user" });
    }

    res.status(200).send({
      message: "Notifications retrieved successfully",
      notifications: userNotifications.notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
