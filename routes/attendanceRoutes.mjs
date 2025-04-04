import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
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

router.post(
  "/api/add-attendance",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  addAttendance
);
router.post(
  "/api/add-leave",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  addLeave
);
router.put(
  "/api/add-week-off",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  addWeekOff
);
router.put(
  "/api/attendance-correction",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  attendanceCorrection
);
router.get(
  "/api/get-all-attendances/:year/:month",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getAllAttendances
);
router.get(
  "/api/get-week-offs/:month_year",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getAllWeekOffs
);
router.get(
  "/api/get-attendances/:month/:year",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getAttendances
);
router.get(
  "/api/get-attendance-summary",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getAttendanceSummary
);
router.get(
  "/api/get-leave-applications/:month_year",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getLeaveApplications
);
router.get(
  "/api/get-own-leaves/:month_year",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getOwnLeaves
);
router.get(
  "/api/get-own-week-offs/:month_year",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  getOwnWeekOffs
);
router.put(
  "/api/update-leave-status",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  updateLeaveStatus
);
router.put(
  "/api/update-week-off-status",
  isAuthenticated,
  hasAccess("Attendance & Leaves"),
  updateWeekOffStatus
);

export default router;
