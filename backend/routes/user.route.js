import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  getUsersInPeriod,
  signout,
  updateAdmins,
  updateUser,
} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get("/getusers", verifyToken, getUsers);
router.get("/getUsersInPeriod", verifyToken, getUsersInPeriod);
router.get("/:userId", getUserById);
router.put("/updateAdmins", verifyToken, updateAdmins);

export default router;
