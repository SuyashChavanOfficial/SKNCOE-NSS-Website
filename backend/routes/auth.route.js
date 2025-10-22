import express from "express";
import {
  getCurrentUser,
  google,
  signin,
  signup,
  refreshAccessToken,
} from "../controller/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/current", verifyToken, getCurrentUser);
router.post("/refresh", refreshAccessToken);

export default router;
