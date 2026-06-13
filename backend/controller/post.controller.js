import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { deleteFileFromR2 } from "../lib/r2.js";
import { MESSAGES } from "../constants/messages.js";

// ✅ Create Post
export const create = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POST.NOT_AUTHORIZED);

  const { title, content, image, newsDate, academicYear } = req.body;

  const slug = title.trim().replace(/\s+/g, "-");

  const user = await User.findById(req.user.id);
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  const authorName = user.name || user.username;
  const authorUsername = user.username;

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
    newsDate: new Date(newsDate),
    authorName,
    authorUsername,
    createdBy: req.user.id,
    createdByName: authorName,
    createdByUsername: authorUsername,
    updatedBy: req.user.id,
    updatedByName: authorName,
    updatedByUsername: authorUsername,
    updateCount: 0,
    updateHistory: [],
  });

  const savedPost = await newPost.save();
  res.status(201).json(savedPost);
};

export const getPosts = async (req, res) => {
  const startIndex = parseInt(req.query.startIndex) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const searchTerm = req.query.searchTerm || "";
  const category = req.query.category || "";
  const academicYear = req.query.academicYear || "";
  const excludeId = req.query.excludeId;

  const query = { isDeleted: { $ne: true } };

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { content: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (category && category.toLowerCase() !== "all") {
    query.category = category;
  }

  if (academicYear && academicYear.toLowerCase() !== "all") {
    query.academicYear = academicYear;
  }

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const posts = await Post.find(query)
    .populate("userId", "username")
    .sort({ newsDate: sortDirection })
    .skip(startIndex)
    .limit(limit);

  const totalPosts = await Post.countDocuments(query);

  res.status(200).json({
    posts,
    totalPosts,
  });
};

export const deletepost = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POST.NOT_AUTHORIZED);

  const { postId, userId } = req.body;

  // Additional security check
  if (req.user.id !== userId && !req.user.isSuperAdmin) {
    throw errorHandler(403, MESSAGES.POST.NOT_AUTHORIZED);
  }

  const post = await Post.findById(postId);
  if (!post) throw errorHandler(404, MESSAGES.POST.NOT_FOUND);

  // Soft delete:
  post.isDeleted = true;
  post.deletedAt = new Date();
  await post.save();

  res.status(200).json(MESSAGES.POST.DELETE_SUCCESS);
};

export const updatepost = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POST.NOT_AUTHORIZED);

  const { postId, userId } = req.body;

  // Additional security check
  if (req.user.id !== userId && !req.user.isSuperAdmin) {
    throw errorHandler(403, MESSAGES.POST.NOT_AUTHORIZED);
  }

  const user = await User.findById(req.user.id);
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  const editorName = user.name || user.username;
  const editorUsername = user.username;

  const updateData = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    academicYear: req.body.academicYear,
    image: req.body.image,
    imageId: req.body.imageId,
    newsDate: req.body.newsDate ? new Date(req.body.newsDate) : undefined,
    updatedBy: req.user.id,
    updatedByName: editorName,
    updatedByUsername: editorUsername,
  };

  if (req.body.deleteOldImageId) {
    try {
      await deleteFileFromR2(req.body.deleteOldImageId);
    } catch (err) {
      console.log("Failed to delete old news image:", err.message);
    }
  }

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId, isDeleted: { $ne: true } },
    {
      $set: updateData,
      $inc: { updateCount: 1 },
      $push: {
        updateHistory: {
          updatedBy: req.user.id,
          updatedByName: editorName,
          updatedByUsername: editorUsername,
          updatedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!updatedPost) throw errorHandler(404, MESSAGES.POST.NOT_FOUND);

  res.status(200).json(updatedPost);
};

export const getPostsInPeriod = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    throw errorHandler(400, MESSAGES.USER.FIELDS_MISSING);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const total = await Post.countDocuments({
    isDeleted: { $ne: true },
    newsDate: { $gte: start, $lte: end },
  });

  res.status(200).json({ total });
};

export const likePost = async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } });

  if (!post) {
    throw errorHandler(404, MESSAGES.POST.NOT_FOUND);
  }

  const userIndex = post.likes.findIndex(
    (id) => id.toString() === req.user.id
  );

  if (userIndex === -1) {
    post.numberOfLikes += 1;
    post.likes.push(req.user.id);
  } else {
    post.numberOfLikes = Math.max(0, post.numberOfLikes - 1);
    post.likes.splice(userIndex, 1);
  }

  await post.save();
  res.status(200).json(post);
};

export const getPostBySlug = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, isDeleted: { $ne: true } });
  if (!post) {
    throw errorHandler(404, MESSAGES.POST.NOT_FOUND);
  }
  res.status(200).json(post);
};

export const getPostById = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.postId, isDeleted: { $ne: true } });
  if (!post) throw errorHandler(404, MESSAGES.POST.NOT_FOUND);
  res.status(200).json({ post });
};
