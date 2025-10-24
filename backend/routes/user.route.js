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

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.post("/volunteer/create", verifyToken, createVolunteer);
router.get("/volunteer/get", verifyToken, getVolunteers);

// (Admin only)
router.get("/getusers", verifyToken, getUsers);
router.get("/getUsersInPeriod", verifyToken, getUsersInPeriod);

// (Super admin only)
router.put("/updateAdmins", verifyToken, updateAdmins);

router.get("/:userId", verifyToken, getUserById);

export default router;
