import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { errorHandler } from "../utils/error.js";
import { generateUploadPresignedUrl, deleteFileFromR2 } from "../lib/r2.js";
import { MESSAGES } from "../constants/messages.js";
import { validateSchema } from "../middleware/validate.js";
import { deleteUploadSchema } from "../validators/schemas.js";

const router = express.Router();

// Route to generate a secure presigned upload URL for authenticated admins
router.post("/presign", verifyToken, async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.UPLOAD.NOT_AUTHORIZED);
  }

  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    throw errorHandler(400, MESSAGES.UPLOAD.FIELDS_REQUIRED);
  }

  const data = await generateUploadPresignedUrl(filename, contentType);
  res.status(200).json(data);
});

// Route to delete a file (either cleanup/orphan or regular deletion)
router.delete("/delete", verifyToken, validateSchema(deleteUploadSchema), async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.UPLOAD.DELETE_NOT_AUTHORIZED);
  }

  const { key } = req.body;
  await deleteFileFromR2(key);
  res.status(200).json({ success: true, message: MESSAGES.UPLOAD.DELETE_SUCCESS });
});

export default router;
