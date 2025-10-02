import express from "express";
import {
  markAttendance,
  getAttendanceByActivity,
  getAttendanceByVolunteer,
} from "../controller/attendance.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Mark attendance (admin only)
router.put("/mark", verifyToken, markAttendance);

// Get attendance for one activity (admin use)
router.get("/activity/:activityId", verifyToken, getAttendanceByActivity);

// Get attendance for one volunteer (self-service)
router.get("/volunteer/:volunteerId", verifyToken, getAttendanceByVolunteer);

export default router;
