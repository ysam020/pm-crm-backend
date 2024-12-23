import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addResignation from "../controllers/resignation/addResignation.mjs";
import viewResignations from "../controllers/resignation/viewResignations.mjs";

const router = express.Router();

router.post("/api/add-resignation", verifySession, addResignation);
router.get("/api/view-resignations", verifySession, viewResignations);

export default router;
