import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addAttendance from "../controllers/attendanceAndLeaves/addAttendance.mjs";
import addLeave from "../controllers/attendanceAndLeaves/addLeave.mjs";
import addWeekOff from "../controllers/attendanceAndLeaves/addWeekOff.mjs";
import attendanceCorrection from "../controllers/attendanceAndLeaves/attendanceCorrection.mjs";
import getAllAttendances from "../controllers/attendanceAndLeaves/getAllAttendances.mjs";
import getAllWeekOffs from "../controllers/attendanceAndLeaves/getAllWeekOffs.mjs";
import getAttendances from "../controllers/attendanceAndLeaves/getAttendances.mjs";
import getAttendanceSummary from "../controllers/attendanceAndLeaves/getAttendanceSummary.mjs";
import getLeaveApplications from "../controllers/attendanceAndLeaves/getLeaveApplications.mjs";
import getOwnLeaves from "../controllers/attendanceAndLeaves/getOwnLeaves.mjs";
import getOwnWeekOffs from "../controllers/attendanceAndLeaves/getOwnWeekOffs.mjs";
import updateLeaveStatus from "../controllers/attendanceAndLeaves/updateLeaveStatus.mjs";
import updateWeekOffStatus from "../controllers/attendanceAndLeaves/updateWeekOffStatus.mjs";

const router = express.Router();

router.post("/api/add-attendance", verifySession, addAttendance);
router.post("/api/add-leave", verifySession, addLeave);
router.put("/api/add-week-off", verifySession, addWeekOff);
router.put("/api/attendance-correction", verifySession, attendanceCorrection);
router.get(
  "/api/get-all-attendances/:year/:month",
  verifySession,
  getAllAttendances
);
router.get("/api/get-week-offs/:month_year", verifySession, getAllWeekOffs);
router.get("/api/get-attendances/:month/:year", verifySession, getAttendances);
router.get("/api/get-attendance-summary", verifySession, getAttendanceSummary);
router.get(
  "/api/get-leave-applications/:month_year",
  verifySession,
  getLeaveApplications
);
router.get("/api/get-own-leaves/:month_year", verifySession, getOwnLeaves);
router.get("/api/get-own-week-offs/:month_year", verifySession, getOwnWeekOffs);
router.put("/api/update-leave-status", verifySession, updateLeaveStatus);
router.put("/api/update-week-off-status", verifySession, updateWeekOffStatus);

export default router;
