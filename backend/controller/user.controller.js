import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { storage } from "../lib/appwrite.js";

const BCRYPT_SALT_ROUNDS = 8;

// ----------------------------
// CREATE VOLUNTEER (ADMIN ONLY)
// ----------------------------
export const createVolunteer = async (req, res, next) => {
  if (!req.user.isAdmin)
    return next(errorHandler(403, "Only admins can add volunteers"));

  try {
    const { username, batch, email, password, dob, picture, pictureId } =
      req.body;

    const hashed = bcryptjs.hashSync(password, BCRYPT_SALT_ROUNDS);

    const volunteer = new User({
      username,
      batch,
      email,
      dob,
      profilePicture: picture,
      profilePictureId: pictureId,
      password: hashed,
      isVolunteer: true,
      isAdmin: false,
      isSuperAdmin: false,
      status: "active",
    });

    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// GET ALL VOLUNTEERS (ADMIN ONLY)
// ----------------------------
export const getVolunteers = async (req, res, next) => {
  if (!req.user.isAdmin)
    return next(errorHandler(403, "Only admins can view volunteers"));

  try {
    const volunteers = await User.find({ isVolunteer: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(volunteers);
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// GET SINGLE USER / VOLUNTEER
// ----------------------------
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return next(errorHandler(404, "User not found!"));

    // Only admin or the user themselves can fetch
    if (!req.user.isAdmin && req.user.id !== req.params.userId)
      return next(errorHandler(403, "Not authorized"));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// UPDATE USER / VOLUNTEER
// ----------------------------
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Volunteer can only update themselves, Admin can update anyone
    if (!req.user.isAdmin && req.user.id !== userId)
      return next(errorHandler(403, "Not authorized"));

    const updateData = {};

    // Common fields
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.password)
      updateData.password = bcryptjs.hashSync(
        req.body.password,
        BCRYPT_SALT_ROUNDS
      );
    if (req.body.profilePicture) {
      updateData.profilePicture = req.body.profilePicture;
      updateData.profilePictureId = req.body.profilePictureId;
    }

    // Volunteer-specific fields
    if (req.body.batch) updateData.batch = req.body.batch;
    if (req.body.dob) updateData.dob = req.body.dob;
    if (
      req.body.status &&
      ["active", "retired", "banned", "blacklisted", "notListed"].includes(
        req.body.status
      )
    )
      updateData.status = req.body.status;
    if (req.body.isVolunteer !== undefined)
      updateData.isVolunteer = req.body.isVolunteer;

    // Delete old profile picture
    if (req.body.deleteOldPictureId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          req.body.deleteOldPictureId
        );
      } catch (err) {
        console.log("Failed to delete old profile picture:", err.message);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) return next(errorHandler(404, "User not found!"));

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// DELETE USER / VOLUNTEER
// ----------------------------
export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  // Admin can delete anyone, user can delete themselves
  if (!req.user.isAdmin && req.user.id !== userId)
    return next(errorHandler(403, "Not authorized"));

  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return next(errorHandler(404, "User not found!"));
    }

    if (userToDelete.profilePictureId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          userToDelete.profilePictureId
        );
      } catch (err) {
        console.log("Failed to delete profile picture:", err.message);
      }
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// SIGN OUT
// ----------------------------
export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .status(200)
      .json({ success: true, message: "User logged out successfully." });
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// GET ALL USERS (ADMIN ONLY)
// ----------------------------
export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((u) => {
      const { password, ...rest } = u._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const oneMonthAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// GET USERS IN PERIOD (ADMIN ONLY)
// ----------------------------
export const getUsersInPeriod = async (req, res, next) => {
  // --- FIX: Added authorization check ---
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return next(errorHandler(400, "startDate and endDate are required"));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const total = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({ total });
  } catch (error) {
    next(error);
  }
};

// ----------------------------
// UPDATE ADMINS (SUPER ADMIN ONLY)
// ----------------------------
export const updateAdmins = async (req, res, next) => {
  if (!req.user.isSuperAdmin)
    return next(errorHandler(403, "Only Super Admin can update admins!"));

  try {
    const { updates } = req.body; // [{ userId, isAdmin }]
    if (!Array.isArray(updates))
      return next(errorHandler(400, "Invalid data format"));

    const updatePromises = updates.map((u) =>
      User.findByIdAndUpdate(u.userId, { isAdmin: u.isAdmin }, { new: true })
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Admins updated successfully" });
  } catch (error) {
    next(error);
  }
};
