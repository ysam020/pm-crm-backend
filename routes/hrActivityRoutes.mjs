import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addHrActivity from "../controllers/hrActivities/addHrActivity.mjs";
import getHrActivities from "../controllers/hrActivities/getHrActivities.mjs";

const router = express.Router();

router.post("/api/add-hr-activity", verifySession, addHrActivity);
router.get("/api/get-hr-activities", verifySession, getHrActivities);

export default router;
