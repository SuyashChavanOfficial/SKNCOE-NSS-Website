import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    academicYear: {
      type: String,
      default: "2025-26",
    },
    image: {
      type: String,
      required: true,
      default:
        "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
    },
    imageId: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    numberOfLikes: {
      type: Number,
      default: 0,
    },
    newsDate: { type: Date, required: true },
    authorName: {
      type: String,
      required: true,
    },
    authorUsername: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    createdByUsername: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedByName: {
      type: String,
    },
    updatedByUsername: {
      type: String,
    },
    updateCount: {
      type: Number,
      default: 0,
    },
    updateHistory: [
      {
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedByName: { type: String },
        updatedByUsername: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

postSchema.index(
  { title: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

postSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
