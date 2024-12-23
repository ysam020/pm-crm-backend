import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import getEvents from "../controllers/general/getEvents.mjs";
import getNotifications from "../controllers/general/getNotifications.mjs";
import deleteNotifications from "../controllers/general/deleteNotifications.mjs";
import generatePreSignedUrl from "../controllers/general/generatePreSignedUrl.mjs";
import getAllUsers from "../controllers/general/getAllUsers.mjs";
import getUserModules from "../controllers/general/getUserModules.mjs";
import assignModules from "../controllers/general/assignModules.mjs";
import unassignModules from "../controllers/general/unassignModules.mjs";

const router = express.Router();

router.get("/api/get-events", verifySession, getEvents);
router.get("/api/get-notifications", verifySession, getNotifications);
router.delete(
  "/api/delete-notification/:_id",
  verifySession,
  deleteNotifications
);
router.post("/api/generate-presigned-url", generatePreSignedUrl);
router.get("/api/get-all-users", verifySession, getAllUsers);
router.get("/api/get-user-modules/:username", verifySession, getUserModules);
router.put("/api/assign-modules", verifySession, assignModules);
router.put("/api/unassign-modules", unassignModules);

export default router;
