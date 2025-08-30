import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;

    if (!content || !content.trim()) {
      return next(errorHandler(400, "Comment cannot be empty."));
    }

    const newComment = new Comment({
      content: content.trim(),
      postId,
      userId: req.user.id,
    });

    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(errorHandler(404, "Comment not found!"));
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
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(errorHandler(404, "Comment not found!"));
    }

    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not authorised to edit this comment!")
      );
    }

    if (!req.body.content || !req.body.content.trim()) {
      return next(errorHandler(400, "Comment cannot be empty."));
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content.trim(),
      },
      { new: true }
    );

    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(errorHandler(404, "Comment not found!"));
    }

    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not authorised to delete this comment!")
      );
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.status(200).json({ message: "Comment Deleted Successfully!" });
  } catch (error) {
    next(error);
  }
};
