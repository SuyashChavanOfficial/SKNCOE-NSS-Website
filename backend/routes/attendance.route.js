import express from "express";
import {
  markAttendance,
  getAttendanceByActivity,
  getAttendanceByVolunteer,
  getAllAttendance,
} from "../controller/attendance.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Mark attendance (create or update)
router.post("/", verifyToken, markAttendance);

// Get attendance for one activity
router.get("/activity/:activityId", verifyToken, getAttendanceByActivity);

router.get("/volunteer/:volunteerId", verifyToken, getAttendanceByVolunteer);

// Get all attendance (admin)
router.get("/", verifyToken, getAllAttendance);

export default router;
