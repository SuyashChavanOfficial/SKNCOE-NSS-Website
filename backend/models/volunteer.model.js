import mongoose from "mongoose";
import Attendance from "./attendance.model.js";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batch: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    picture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
    },
    pictureId: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ Cascade delete attendance when a volunteer is deleted
volunteerSchema.pre("findOneAndDelete", async function (next) {
  const volunteerId = this.getQuery()["_id"];
  if (volunteerId) {
    await Attendance.deleteMany({ volunteer: volunteerId });
  }
  next();
});

const Volunteer = mongoose.model("Volunteer", volunteerSchema);
export default Volunteer;
