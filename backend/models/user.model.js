import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
    },
    profilePictureId: {
      type: String,
      default: null,
    },

    // Roles
    isVolunteer: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    // Volunteer-specific fields
    nssID: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    batch: {
      type: String,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "retired", "banned", "blacklisted", "notListed"],
      default: "notListed",
    },

    // College-related Details
    prnNumber: {
      type: String,
      default: null,
    },
    eligibilityNumber: {
      type: Number,
      default: null,
    },
    rollNumber: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
