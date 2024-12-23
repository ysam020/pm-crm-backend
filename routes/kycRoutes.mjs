import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import completeKyc from "../controllers/employeeKyc/completeKyc.mjs";
import kycApproval from "../controllers/employeeKyc/kycApproval.mjs";
import viewAllKycs from "../controllers/employeeKyc/viewAllKycs.mjs";

const router = express.Router();

router.post("/api/complete-kyc", verifySession, completeKyc);
router.post("/api/kyc-approval", verifySession, kycApproval);
router.get("/api/view-all-kycs", verifySession, viewAllKycs);

export default router;
