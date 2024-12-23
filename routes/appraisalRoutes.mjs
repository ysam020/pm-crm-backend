import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addAppraisal from "../controllers/appraisals/addAppraisal.mjs";
import viewAppraisals from "../controllers/appraisals/viewAppraisals.mjs";

const router = express.Router();

router.post("/api/add-appraisal", verifySession, addAppraisal);
router.get("/api/view-appraisals/:username", verifySession, viewAppraisals);

export default router;
