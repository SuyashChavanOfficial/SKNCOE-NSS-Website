import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import { storage } from "../lib/appwrite.js";

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  if (!req.body.title || !req.body.content || !req.body.image)
    return next(errorHandler(400, "All Fields are required"));

  const slug = req.body.title.trim().replace(/\s+/g, "-");

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const searchTerm = req.query.searchTerm || "";
    const category = req.query.category || "";

    const query = {};

    // Filter by searchTerm
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { content: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate("userId", "username")
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(errorHandler(404, "Post not found!"));

    // 🗑️ delete file if exists
    if (post.imageId) {
      try {
        await storage.deleteFile(process.env.APPWRITE_STORAGE_ID, post.imageId);
      } catch (err) {
        console.log("Failed to delete news image:", err.message);
      }
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("Post and its image deleted successfully!");
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      image: req.body.image,
      imageId: req.body.imageId,
    };

    // 🗑️ delete old image if new one uploaded
    if (req.body.deleteOldImageId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          req.body.deleteOldImageId
        );
      } catch (err) {
        console.log("Failed to delete old news image:", err.message);
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const getPostsInPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const total = await Post.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({ total });
  } catch (error) {
    console.error("getPostsInPeriod error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return next(errorHandler(404, "Post not found!"));
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
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });

    if (!post) {
      return next(errorHandler(404, "Post not found!"));
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(errorHandler(404, "Post not found!"));
    res.status(200).json({ post }); // ✅ wrapped in object
  } catch (error) {
    next(error);
  }
};
