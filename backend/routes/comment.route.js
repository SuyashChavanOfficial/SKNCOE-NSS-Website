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
const router = express.Router();

router.post("/create", verifyToken, createComment);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likeComment/:commentId", verifyToken, likeComment);
router.put("/editComment/:commentId", verifyToken, editComment);
router.delete("/deleteComment/:commentId", verifyToken, deleteComment);
router.get("/getComments/", verifyToken, getComments);
router.get("/getCommentsInPeriod", verifyToken, getCommentsInPeriod);

export default router;
