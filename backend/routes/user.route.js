import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  getUsersInPeriod,
  signout,
  updateAdmins,
  updateUser,
  createVolunteer,
  getVolunteers,
} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

import { validateSchema } from "../middleware/validate.js";
import {
  createVolunteerSchema,
  updateVolunteerSchema,
  deleteUserSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.put("/update", verifyToken, validateSchema(updateVolunteerSchema), updateUser);
router.delete("/delete", verifyToken, validateSchema(deleteUserSchema), deleteUser);
router.post("/signout", signout);
router.post("/create", verifyToken, validateSchema(createVolunteerSchema), createVolunteer);
router.get("/get-volunteers", verifyToken, getVolunteers);

// (Admin only)
router.get("/get-users", verifyToken, getUsers);
router.get("/get-users-in-period", verifyToken, getUsersInPeriod);

// (Super admin only)
router.put("/update-admins", verifyToken, updateAdmins);

router.get("/:userId", verifyToken, getUserById);

export default router;
