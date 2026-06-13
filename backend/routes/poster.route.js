import express from "express";
import {
  createPoster,
  deletePoster,
  getAllPosters,
  updatePoster,
} from "../controller/poster.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

import { validateSchema } from "../middleware/validate.js";
import {
  posterSchema,
  updatePosterSchema,
  deletePosterSchema,
} from "../validators/schemas.js";

const router = express.Router();

// Public routes
router.get("/all", getAllPosters);

// Admin routes
router.post("/create", verifyToken, validateSchema(posterSchema), createPoster);
router.put("/update", verifyToken, validateSchema(updatePosterSchema), updatePoster);
router.delete("/delete", verifyToken, validateSchema(deletePosterSchema), deletePoster);

export default router;
