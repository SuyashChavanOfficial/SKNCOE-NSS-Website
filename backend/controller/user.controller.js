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
    const {
      username,
      batch,
      email,
      password,
      dob,
      profilePicture,
      profilePictureId,
      nssID,
      prnNumber,
      eligibilityNumber,
      rollNumber,
    } = req.body;

    if (!username || !batch || !email || !password || !nssID) {
      return next(errorHandler(400, "Required fields are missing."));
    }

    const hashed = bcryptjs.hashSync(password, BCRYPT_SALT_ROUNDS);

    const volunteer = new User({
      username,
      batch,
      email,
      dob: dob || null,
      profilePicture: profilePicture || undefined,
      profilePictureId: profilePictureId || null,
      password: hashed,
      isVolunteer: true,
      isAdmin: false,
      isSuperAdmin: false,
      status: "active",
      nssID: nssID || null, // Ensure nssID is null if empty
      prnNumber: prnNumber || null,
      eligibilityNumber: eligibilityNumber || null,
      rollNumber: rollNumber || null,
    });

    const saved = await volunteer.save({ validateBeforeSave: true });
    const { password: _, ...volunteerData } = saved._doc;
    res.status(201).json(volunteerData);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.nssID) {
        return next(errorHandler(400, "NSS ID already exists."));
      } else if (error.keyPattern?.email) {
        return next(errorHandler(400, "Email already exists."));
      } else {
        return next(
          errorHandler(400, "A unique field value conflict occurred.")
        );
      }
    }
    if (error.name === "ValidationError") {
      return next(
        errorHandler(
          400,
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", ")
        )
      );
    }
    next(error);
  }
};

// ----------------------------
// UPDATE USER / VOLUNTEER
// ----------------------------
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!req.user.isAdmin && req.user.id !== userId)
      return next(errorHandler(403, "Not authorized"));

    const updateData = {};

    // Common fields
    if (req.body.username !== undefined)
      updateData.username = req.body.username;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.password)
      updateData.password = bcryptjs.hashSync(
        req.body.password,
        BCRYPT_SALT_ROUNDS
      );
    if (req.body.profilePicture !== undefined) {
      updateData.profilePicture = req.body.profilePicture;
      updateData.profilePictureId = req.body.profilePictureId;
    }

    // Volunteer-specific fields
    if (req.body.batch !== undefined) updateData.batch = req.body.batch;
    if (req.body.dob !== undefined) updateData.dob = req.body.dob || null;
    if (
      req.body.status &&
      ["active", "retired", "banned", "blacklisted", "notListed"].includes(
        req.body.status
      )
    )
      updateData.status = req.body.status;
    if (req.body.isVolunteer !== undefined)
      updateData.isVolunteer = req.body.isVolunteer;

    if (req.body.nssID !== undefined) updateData.nssID = req.body.nssID || null; // Ensure nssID is null if empty
    if (req.body.prnNumber !== undefined)
      updateData.prnNumber = req.body.prnNumber || null;
    if (req.body.eligibilityNumber !== undefined)
      updateData.eligibilityNumber = req.body.eligibilityNumber || null;
    if (req.body.rollNumber !== undefined)
      updateData.rollNumber = req.body.rollNumber || null;

    if (req.body.deleteOldPictureId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          req.body.deleteOldPictureId
        );
      } catch (err) {
        console.log(
          `⚠️ Failed to delete old profile picture ${req.body.deleteOldPictureId}:`,
          err.message
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return next(errorHandler(404, "User not found!"));

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.nssID) {
        return next(errorHandler(400, "NSS ID already exists."));
      } else if (error.keyPattern?.email) {
        return next(errorHandler(400, "Email already exists."));
      } else {
        return next(
          errorHandler(400, "A unique field value conflict occurred.")
        );
      }
    }
    if (error.name === "ValidationError") {
      return next(
        errorHandler(
          400,
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", ")
        )
      );
    }
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
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const query = { isVolunteer: true };

    const volunteers = await User.find(query)
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    // Remove passwords before sending
    const volunteersWithoutPassword = volunteers.map((v) => {
      const { password, ...rest } = v._doc;
      return rest;
    });

    const totalVolunteers = await User.countDocuments(query);

    res.status(200).json({
      volunteers: volunteersWithoutPassword,
      totalVolunteers,
    });
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
// DELETE USER / VOLUNTEER
// ----------------------------
export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  const loggedInUser = req.user;

  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return next(errorHandler(404, "User not found!"));
    }

    // Case 1: The user to delete is a VOLUNTEER
    if (userToDelete.isVolunteer) {
      if (!loggedInUser.isAdmin) {
        return next(
          errorHandler(403, "Not authorized to delete this volunteer")
        );
      }
    } else {
      if (!loggedInUser.isAdmin && loggedInUser.id !== userId) {
        return next(
          errorHandler(
            403,
            "You are only authorized to delete your own account"
          )
        );
      }
    }

    // If authorization passed, proceed with deletion
    if (userToDelete.profilePictureId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          userToDelete.profilePictureId
        );
      } catch (err) {
        console.log(
          `Failed to delete profile picture ${userToDelete.profilePictureId}:`,
          err.message
        );
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

    // Basic validation for each update object
    for (const u of updates) {
      if (!u.userId || typeof u.isAdmin !== "boolean") {
        return next(
          errorHandler(
            400,
            "Invalid update format: Each item must have userId and isAdmin (boolean)."
          )
        );
      }
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
