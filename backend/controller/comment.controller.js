import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";
import { MESSAGES } from "../constants/messages.js";

export const createComment = async (req, res) => {
  const { content, postId } = req.body;

  if (!content || !content.trim()) {
    throw errorHandler(400, MESSAGES.COMMENT.EMPTY);
  }

  const newComment = new Comment({
    content: content.trim(),
    postId,
    userId: req.user.id,
  });

  await newComment.save();
  res.status(201).json(newComment);
};

export const getPostComments = async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId, isDeleted: { $ne: true } }).sort({
    createdAt: -1,
  });

  res.status(200).json(comments);
};

export const likeComment = async (req, res) => {
  const { commentId } = req.body;
  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } });

  if (!comment) {
    throw errorHandler(404, MESSAGES.COMMENT.NOT_FOUND);
  }

  const userIndex = comment.likes.findIndex(
    (id) => id.toString() === req.user.id
  );

  if (userIndex === -1) {
    comment.numberOfLikes += 1;
    comment.likes.push(req.user.id);
  } else {
    comment.numberOfLikes = Math.max(0, comment.numberOfLikes - 1);
    comment.likes.splice(userIndex, 1);
  }

  await comment.save();
  res.status(200).json(comment);
};

export const editComment = async (req, res) => {
  const { commentId, content } = req.body;
  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } });

  if (!comment) {
    throw errorHandler(404, MESSAGES.COMMENT.NOT_FOUND);
  }

  if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.COMMENT.EDIT_UNAUTHORIZED);
  }

  if (!content || !content.trim()) {
    throw errorHandler(400, MESSAGES.COMMENT.EMPTY);
  }

  const editedComment = await Comment.findOneAndUpdate(
    { _id: commentId, isDeleted: { $ne: true } },
    {
      content: content.trim(),
    },
    { new: true }
  );

  res.status(200).json(editedComment);
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.body;
  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } });

  if (!comment) {
    throw errorHandler(404, MESSAGES.COMMENT.NOT_FOUND);
  }

  if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.COMMENT.DELETE_UNAUTHORIZED);
  }

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  await comment.save();

  res.status(200).json({ message: MESSAGES.COMMENT.DELETE_SUCCESS });
};

export const getComments = async (req, res) => {
  if (!req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.COMMENT.ACCESS_UNAUTHORIZED);
  }

  const startIndex = parseInt(req.query.startIndex) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const query = { isDeleted: { $ne: true } };

  const comments = await Comment.find(query)
    .populate("postId", "title slug")
    .populate("userId", "username")
    .sort({ createdAt: sortDirection })
    .skip(startIndex)
    .limit(limit);

  const totalComments = await Comment.countDocuments(query);
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const lastMonthComments = await Comment.countDocuments({
    ...query,
    createdAt: { $gte: oneMonthAgo },
  });

  res.status(200).json({
    comments,
    totalComments,
    lastMonthComments,
  });
};

export const getCommentsInPeriod = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    throw errorHandler(400, MESSAGES.USER.FIELDS_MISSING);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const total = await Comment.countDocuments({
    isDeleted: { $ne: true },
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({ total });
};
