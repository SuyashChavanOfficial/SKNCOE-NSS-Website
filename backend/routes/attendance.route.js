import express from "express";
import {
  getAttendanceByActivity,
  getAllAttendance,
} from "../controller/attendance.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/activity/:activityId", verifyToken, getAttendanceByActivity);
router.get("/", verifyToken, getAllAttendance);

export default router;
