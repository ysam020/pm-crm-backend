import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import addResignation from "../controllers/resignation/addResignation.mjs";
import viewResignations from "../controllers/resignation/viewResignations.mjs";
import addExitFeedback from "../controllers/resignation/addExitFeedback.mjs";

const router = express.Router();

router.post("/api/add-resignation", isAuthenticated, addResignation);
router.get("/api/view-resignations", isAuthenticated, viewResignations);
router.post("/api/add-exit-feedback", isAuthenticated, addExitFeedback);

export default router;
