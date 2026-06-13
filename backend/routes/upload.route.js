import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { errorHandler } from "../utils/error.js";
import { generateUploadPresignedUrl, deleteFileFromR2 } from "../lib/r2.js";

const router = express.Router();

// Route to generate a secure presigned upload URL for authenticated admins
router.post("/presign", verifyToken, async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(errorHandler(403, "Not authorized to upload files."));
  }

  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return next(errorHandler(400, "filename and contentType are required."));
  }

  try {
    const data = await generateUploadPresignedUrl(filename, contentType);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Route to delete a file (either cleanup/orphan or regular deletion)
router.delete("/delete/:key", verifyToken, async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(errorHandler(403, "Not authorized to delete files."));
  }

  const { key } = req.params;
  if (!key) {
    return next(errorHandler(400, "File key is required."));
  }

  try {
    await deleteFileFromR2(key);
    res.status(200).json({ success: true, message: "File deleted successfully from R2." });
  } catch (error) {
    next(error);
  }
});

export default router;
