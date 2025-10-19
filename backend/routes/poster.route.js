import express from "express";
import {
  addPoster,
  deletePoster,
  getTodaysPoster,
  updatePoster,
} from "../controller/poster.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Public route
router.get("/today", getTodaysPoster);

// Admin routes
router.post("/add", verifyToken, addPoster);
router.put("/update/:posterId", verifyToken, updatePoster);
router.delete("/delete/:posterId", verifyToken, deletePoster);

export default router;
