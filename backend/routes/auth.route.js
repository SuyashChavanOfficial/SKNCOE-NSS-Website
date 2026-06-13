import express from "express";
import {
  getCurrentUser,
  google,
  signin,
  signup,
  refreshAccessToken,
} from "../controller/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { validateSchema } from "../middleware/validate.js";
import { signupSchema, signinSchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/signup", validateSchema(signupSchema), signup);
router.post("/signin", validateSchema(signinSchema), signin);
router.post("/google", google);
router.get("/current", verifyToken, getCurrentUser);
router.post("/refresh", refreshAccessToken);

export default router;
