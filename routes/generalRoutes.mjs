import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import getEvents from "../controllers/general/getEvents.mjs";
import getNotifications from "../controllers/general/getNotifications.mjs";
import generatePreSignedUrl from "../controllers/general/generatePreSignedUrl.mjs";
import getAllUsers from "../controllers/general/getAllUsers.mjs";
import getUserModules from "../controllers/general/getUserModules.mjs";
import assignModules from "../controllers/general/assignModules.mjs";
import unassignModules from "../controllers/general/unassignModules.mjs";

const router = express.Router();

router.get("/api/get-events", isAuthenticated, getEvents);
router.get("/api/get-notifications", isAuthenticated, getNotifications);
router.post("/api/generate-presigned-url", generatePreSignedUrl);
router.get("/api/get-all-users", isAuthenticated, getAllUsers);
router.get("/api/get-user-modules/:username", isAuthenticated, getUserModules);
router.put("/api/assign-modules", isAuthenticated, assignModules);
router.put("/api/unassign-modules", isAuthenticated, unassignModules);

export default router;
