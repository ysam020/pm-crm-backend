import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import schedule from "node-schedule";
import login from "../controllers/auth/login.mjs";
import logout from "../controllers/auth/logout.mjs";
import logoutFromAllSessions from "../controllers/auth/logoutFromAllSessions.mjs";
import resetPassword from "../controllers/auth/resetPassword.mjs";
import enableTwoFactor from "../controllers/auth/enableTwoFactor.mjs";
import disableTwoFactor from "../controllers/auth/disableTwoFactor.mjs";
import sendForgotPasswordOtp from "../controllers/auth/sendForgotPasswordOtp.mjs";
import updatePassword from "../controllers/auth/updatePassword.mjs";
import verifyUser from "../controllers/auth/verifyUser.mjs";
import resetBlockedAccounts from "../controllers/auth/resetBlockedAccounts.mjs";
import requestNewBackupCodes from "../controllers/auth/requestNewBackupCodes.mjs";
import sendBackupCodesMail from "../controllers/auth/sendBackupCodesMail.mjs";
import getSessionData from "../controllers/auth/getSessionData.mjs";
import deleteBackupCodes from "../controllers/auth/deleteBackupCodes.mjs";

const router = express.Router();

router.post("/api/login", login);
router.post("/api/logout", logout);
router.get(
  "/api/logout-from-all-sessions",
  verifySession,
  logoutFromAllSessions
);
router.put("/api/reset-password", verifySession, resetPassword),
  router.get("/api/enable-two-factor", verifySession, enableTwoFactor),
  router.delete("/api/disable-two-factor", verifySession, disableTwoFactor),
  router.post("/api/send-forgot-password-otp", sendForgotPasswordOtp);
router.put("/api/update-password", updatePassword);
router.get("/api/verify-user", verifySession, verifyUser);
router.get(
  "/api/request-new-backup-codes",
  verifySession,
  requestNewBackupCodes
);
router.get("/api/send-backup-codes-email", verifySession, sendBackupCodesMail);
router.delete("/api/delete-backup-codes", verifySession, deleteBackupCodes);
router.get("/api/get-session-data", verifySession, getSessionData);
schedule.scheduleJob("0 0 * * *", async () => {
  // schedule.scheduleJob("*/10 * * * * *", async () => {
  const result = await resetBlockedAccounts();
  if (result.success) {
    console.log(`Scheduled job: Reset ${result.count} blocked accounts.`);
  } else {
    console.error(`Scheduled job failed: ${result.error}`);
  }
});

export default router;
