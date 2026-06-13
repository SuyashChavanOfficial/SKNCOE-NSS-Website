import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  create,
  deletepost,
  getPostById,
  getPostBySlug,
  getPosts,
  getPostsInPeriod,
  likePost,
  updatepost,
} from "../controller/post.controller.js";

import { validateSchema } from "../middleware/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  likePostSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.post("/create", verifyToken, validateSchema(createPostSchema), create);
router.get("/get-posts", getPosts);
router.get("/get-post-by-id/:postId", getPostById);
router.get("/get-post/:slug", getPostBySlug);
router.delete("/delete-post", verifyToken, validateSchema(deletePostSchema), deletepost);
router.put("/update-post", verifyToken, validateSchema(updatePostSchema), updatepost);
router.get("/get-posts-in-period", verifyToken, getPostsInPeriod);
router.put("/like-post", verifyToken, validateSchema(likePostSchema), likePost);

export default router;
