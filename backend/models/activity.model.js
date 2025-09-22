import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
