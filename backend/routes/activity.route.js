import express from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  toggleInterest,
  getInterestedUsers,
  linkNewsToActivity,
} from "../controller/activity.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createActivity);
router.get("/get", getActivities);
router.get("/get/:activityId", getActivityById);
router.put("/update/:activityId", verifyToken, updateActivity);
router.delete("/delete/:activityId", verifyToken, deleteActivity);

router.put("/toggleInterest/:activityId", verifyToken, toggleInterest);
router.get("/interestedUsers/:activityId", verifyToken, getInterestedUsers);

router.put("/linkNews/:activityId", verifyToken, linkNewsToActivity);

export default router;
