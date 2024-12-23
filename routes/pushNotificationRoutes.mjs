import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import disablePushNotifications from "../controllers/pushNotifications/disablePushNotifications.mjs";
import saveFcmToken from "../controllers/pushNotifications/saveFcmToken.mjs";

const router = express.Router();

router.delete(
  "/api/disable-push-notifications",
  verifySession,
  disablePushNotifications
);
router.put("/api/save-fcm-token", verifySession, saveFcmToken);

export default router;
