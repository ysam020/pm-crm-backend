import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addResignation from "../controllers/resignation/addResignation.mjs";
import viewResignations from "../controllers/resignation/viewResignations.mjs";
import addExitFeedback from "../controllers/resignation/addExitFeedback.mjs";

const router = express.Router();

router.post("/api/add-resignation", verifySession, addResignation);
router.get("/api/view-resignations", verifySession, viewResignations);
router.post("/api/add-exit-feedback", verifySession, addExitFeedback);

export default router;
