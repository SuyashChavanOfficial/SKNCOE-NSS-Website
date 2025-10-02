import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ volunteer: 1, activity: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
