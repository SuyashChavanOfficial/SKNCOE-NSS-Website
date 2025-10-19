import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    media: { type: String, required: true },
    mediaId: { type: String, default: null },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption: { type: String, required: true },
    date: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

const Poster = mongoose.model("Poster", posterSchema);
export default Poster;
