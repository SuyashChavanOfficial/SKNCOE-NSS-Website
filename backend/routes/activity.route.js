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

import { validateSchema } from "../middleware/validate.js";
import {
  createActivitySchema,
  updateActivitySchema,
  deleteActivitySchema,
  toggleInterestSchema,
  linkNewsSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.post("/create", verifyToken, validateSchema(createActivitySchema), createActivity);
router.get("/get", getActivities);
router.get("/get/:activityId", getActivityById);
router.put("/update", verifyToken, validateSchema(updateActivitySchema), updateActivity);
router.delete("/delete", verifyToken, validateSchema(deleteActivitySchema), deleteActivity);

router.put("/toggle-interest", verifyToken, validateSchema(toggleInterestSchema), toggleInterest);
router.get("/interested-users/:activityId", verifyToken, getInterestedUsers);

router.put("/link-news", verifyToken, validateSchema(linkNewsSchema), linkNewsToActivity);

export default router;
