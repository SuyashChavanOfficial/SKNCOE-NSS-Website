import mongoose from "mongoose";
import Attendance from "./attendance.model.js"; // import attendance model

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    poster: {
      type: String,
      required: true,
      default:
        "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
    },
    posterId: { type: String, default: null },
    startDate: { type: Date, required: true },
    expectedDurationHours: { type: Number, required: true },
    description: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    linkedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
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

activitySchema.pre("findOneAndDelete", async function (next) {
  const activityId = this.getQuery()["_id"];
  if (activityId) {
    await Attendance.deleteMany({ activity: activityId });
  }
  next();
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
