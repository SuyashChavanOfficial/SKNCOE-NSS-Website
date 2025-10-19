import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imageId: { type: String, default: null },
    caption: { type: String, required: true },
    date: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

const Poster = mongoose.model("Poster", posterSchema);
export default Poster;
