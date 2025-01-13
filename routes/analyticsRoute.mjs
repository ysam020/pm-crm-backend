import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import getEmployeeDepartments from "../controllers/analytics/getEmployeeDepartments.mjs";
import getEmployeeDesignations from "../controllers/analytics/getEmployeeDesignations.mjs";
import getAgeDistribution from "../controllers/analytics/getAgeDistribution.mjs";
import getJoiningData from "../controllers/analytics/getJoiningData.mjs";
import employeePerformance from "../controllers/analytics/employeePerformance.mjs";

const router = express.Router();

router.get(
  "/api/get-employee-departments",
  verifySession,
  getEmployeeDepartments
);
router.get(
  "/api/get-employee-designations",
  verifySession,
  getEmployeeDesignations
);
router.get("/api/get-age-distribution", verifySession, getAgeDistribution);
router.get("/api/get-joining-data", verifySession, getJoiningData);
router.get("/api/employee-performance", verifySession, employeePerformance);

export default router;
