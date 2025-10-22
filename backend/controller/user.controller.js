import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { storage } from "../lib/appwrite.js";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only update your own account!"));
  }

  try {
    const updateData = {};

    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.password)
      updateData.password = bcryptjs.hashSync(req.body.password, 10);
    if (req.body.profilePicture) {
      updateData.profilePicture = req.body.profilePicture;
      updateData.profilePictureId = req.body.profilePictureId;
    }

    // 🗑️ Delete old picture if new one is uploaded
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
      req.params.userId,
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

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only delete your own account!"));
  }

  try {
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json("User has been deleted.");
  } catch (error) {
    next(error);
  }
};

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

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not authorized to access this resource.")
    );
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const getUsersWithoutPassword = users.map((user) => {
      const { password: pass, ...rest } = user._doc;

      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: getUsersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUsersInPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const total = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({ total }); // 🔥 don’t return full users array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdmins = async (req, res, next) => {
  if (!req.user.isSuperAdmin) {
    return next(errorHandler(403, "Only Super Admin can update admins!"));
  }

  try {
    const { updates } = req.body; // [{ userId, isAdmin }]
    if (!Array.isArray(updates)) {
      return next(errorHandler(400, "Invalid data format"));
    }

    const updatePromises = updates.map((u) =>
      User.findByIdAndUpdate(u.userId, { isAdmin: u.isAdmin }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Admins updated successfully" });
  } catch (error) {
    next(error);
  }
};
