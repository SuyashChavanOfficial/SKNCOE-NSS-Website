import express from "express";
import {
  createComment,
  deleteComment,
  editComment,
  getComments,
  getCommentsInPeriod,
  getPostComments,
  likeComment,
} from "../controller/comment.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { validateSchema } from "../middleware/validate.js";
import {
  commentSchema,
  likeCommentSchema,
  editCommentSchema,
  deleteCommentSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.post("/create", verifyToken, validateSchema(commentSchema), createComment);
router.get("/get-post-comments/:postId", getPostComments);
router.put("/like-comment", verifyToken, validateSchema(likeCommentSchema), likeComment);
router.put("/edit-comment", verifyToken, validateSchema(editCommentSchema), editComment);
router.delete("/delete-comment", verifyToken, validateSchema(deleteCommentSchema), deleteComment);
router.get("/get-comments", verifyToken, getComments);
router.get("/get-comments-in-period", verifyToken, getCommentsInPeriod);

export default router;
