import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Activity from "../models/activity.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { deleteFileFromR2 } from "../lib/r2.js";
import { MESSAGES } from "../constants/messages.js";

const BCRYPT_SALT_ROUNDS = 8;

const generateUniqueUsername = async (name) => {
  const base = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "vol";
  let username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
  let exists = await User.findOne({ username });
  while (exists) {
    username = `${base}_${Math.floor(10000 + Math.random() * 90000)}`;
    exists = await User.findOne({ username });
  }
  return username;
};

// ----------------------------
// CREATE VOLUNTEER (ADMIN ONLY)
// ----------------------------
export const createVolunteer = async (req, res) => {
  if (!req.user.isAdmin)
    throw errorHandler(403, MESSAGES.USER.ADMIN_ONLY_VOLUNTEER);

  const {
    name,
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

  const username = await generateUniqueUsername(name);
  const hashed = bcryptjs.hashSync(password, BCRYPT_SALT_ROUNDS);

  const volunteer = new User({
    name,
    username,
    batch,
    email,
    dob: dob || undefined,
    profilePicture: profilePicture || undefined,
    profilePictureId: profilePictureId || undefined,
    password: hashed,
    isVolunteer: true,
    isAdmin: false,
    isSuperAdmin: false,
    status: "active",
    nssID: nssID,
    prnNumber: prnNumber || undefined,
    eligibilityNumber: eligibilityNumber || undefined,
    rollNumber: rollNumber || undefined,
  });

  const saved = await volunteer.save({ validateBeforeSave: true });
  const { password: _, ...volunteerData } = saved._doc;
  res.status(201).json(volunteerData);
};

// ----------------------------
// UPDATE USER / VOLUNTEER
// ----------------------------
export const updateUser = async (req, res) => {
  const { userId } = req.body;

  if (!req.user.isAdmin && req.user.id !== userId)
    throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);

  const targetUser = await User.findById(userId);
  if (!targetUser) throw errorHandler(404, MESSAGES.USER.NOT_FOUND);

  // Volunteers cannot edit their profiles at all (only admins can edit volunteers)
  if (targetUser.isVolunteer && !req.user.isAdmin) {
    throw errorHandler(403, MESSAGES.USER.VOLUNTEER_EDIT_RESTRICTED);
  }

  const updateData = {};

  // Common fields
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.username !== undefined) updateData.username = req.body.username;
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

  if (req.body.dob !== undefined)
    updateData.dob = req.body.dob ? req.body.dob : undefined;

  if (
    req.body.status &&
    ["active", "retired", "banned", "blacklisted", "notListed"].includes(
      req.body.status
    )
  )
    updateData.status = req.body.status;

  if (req.body.isVolunteer !== undefined)
    updateData.isVolunteer = req.body.isVolunteer;

  if (req.body.nssID !== undefined)
    updateData.nssID = req.body.nssID ? req.body.nssID : undefined;

  if (req.body.prnNumber !== undefined)
    updateData.prnNumber = req.body.prnNumber
      ? req.body.prnNumber
      : undefined;

  if (req.body.eligibilityNumber !== undefined)
    updateData.eligibilityNumber = req.body.eligibilityNumber
      ? req.body.eligibilityNumber
      : undefined;

  if (req.body.rollNumber !== undefined)
    updateData.rollNumber = req.body.rollNumber
      ? req.body.rollNumber
      : undefined;

  if (req.body.deleteOldPictureId) {
    try {
      await deleteFileFromR2(req.body.deleteOldPictureId);
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

  if (!updatedUser) throw errorHandler(404, MESSAGES.USER.NOT_FOUND);

  // Cascade update to Posts and Activities if name or username changes
  if (req.body.name !== undefined || req.body.username !== undefined) {
    const postsUpdate = {};
    if (req.body.name !== undefined) postsUpdate.authorName = req.body.name;
    if (req.body.username !== undefined) postsUpdate.authorUsername = req.body.username;

    if (Object.keys(postsUpdate).length > 0) {
      await Post.updateMany({ userId: userId }, { $set: postsUpdate });
    }

    const metaUpdate = {};
    if (req.body.name !== undefined) {
      metaUpdate.createdByName = req.body.name;
      metaUpdate.updatedByName = req.body.name;
    }
    if (req.body.username !== undefined) {
      metaUpdate.createdByUsername = req.body.username;
      metaUpdate.updatedByUsername = req.body.username;
    }

    if (Object.keys(metaUpdate).length > 0) {
      await Post.updateMany({ createdBy: userId }, { $set: { createdByName: metaUpdate.createdByName, createdByUsername: metaUpdate.createdByUsername } });
      await Post.updateMany({ updatedBy: userId }, { $set: { updatedByName: metaUpdate.updatedByName, updatedByUsername: metaUpdate.updatedByUsername } });

      await Activity.updateMany({ createdBy: userId }, { $set: { createdByName: metaUpdate.createdByName, createdByUsername: metaUpdate.createdByUsername } });
      await Activity.updateMany({ updatedBy: userId }, { $set: { updatedByName: metaUpdate.updatedByName, updatedByUsername: metaUpdate.updatedByUsername } });
    }
  }

  const { password, ...rest } = updatedUser._doc;
  res.status(200).json(rest);
};

// ----------------------------
// GET ALL VOLUNTEERS (ADMIN ONLY)
// ----------------------------
export const getVolunteers = async (req, res) => {
  if (!req.user.isAdmin)
    throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);

  const startIndex = parseInt(req.query.startIndex) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const query = { isVolunteer: true, isDeleted: { $ne: true } };

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
};

// ----------------------------
// GET SINGLE USER / VOLUNTEER
// ----------------------------
export const getUserById = async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, isDeleted: { $ne: true } });

  if (!user) throw errorHandler(404, MESSAGES.USER.NOT_FOUND);

  // Only admin or the user themselves can fetch
  if (!req.user.isAdmin && req.user.id !== req.params.userId)
    throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);

  const { password, ...rest } = user._doc;
  res.status(200).json(rest);
};

// ----------------------------
// DELETE USER / VOLUNTEER
// ----------------------------
export const deleteUser = async (req, res) => {
  const { userId } = req.body;
  const loggedInUser = req.user;

  const userToDelete = await User.findById(userId);
  if (!userToDelete) {
    throw errorHandler(404, MESSAGES.USER.NOT_FOUND);
  }

  // Case 1: The user to delete is a VOLUNTEER
  if (userToDelete.isVolunteer) {
    if (!loggedInUser.isAdmin) {
      throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);
    }
  } else {
    if (!loggedInUser.isAdmin && loggedInUser.id !== userId) {
      throw errorHandler(
        403,
        MESSAGES.USER.NOT_AUTHORIZED
      );
    }
  }

  // Soft delete:
  userToDelete.isDeleted = true;
  userToDelete.deletedAt = new Date();
  await userToDelete.save();

  res.status(200).json({ message: MESSAGES.USER.DELETE_SUCCESS });
};

// ----------------------------
// SIGN OUT
// ----------------------------
export const signout = async (req, res) => {
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
    .json({ success: true, message: MESSAGES.USER.SIGN_OUT_SUCCESS });
};

// ----------------------------
// GET ALL USERS (ADMIN ONLY)
// ----------------------------
export const getUsers = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);

  const startIndex = parseInt(req.query.startIndex) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const query = { isDeleted: { $ne: true } };

  const users = await User.find(query)
    .sort({ createdAt: sortDirection })
    .skip(startIndex)
    .limit(limit);

  const usersWithoutPassword = users.map((u) => {
    const { password, ...rest } = u._doc;
    return rest;
  });

  const totalUsers = await User.countDocuments(query);
  const oneMonthAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 1)
  );
  const lastMonthUsers = await User.countDocuments({
    ...query,
    createdAt: { $gte: oneMonthAgo },
  });

  res.status(200).json({
    users: usersWithoutPassword,
    totalUsers,
    lastMonthUsers,
  });
};

// ----------------------------
// GET USERS IN PERIOD (ADMIN ONLY)
// ----------------------------
export const getUsersInPeriod = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.USER.NOT_AUTHORIZED);

  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    throw errorHandler(400, MESSAGES.USER.FIELDS_MISSING);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const total = await User.countDocuments({
    isDeleted: { $ne: true },
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({ total });
};

// ----------------------------
// UPDATE ADMINS (SUPER ADMIN ONLY)
// ----------------------------
export const updateAdmins = async (req, res) => {
  if (!req.user.isSuperAdmin)
    throw errorHandler(403, MESSAGES.USER.SUPER_ADMIN_ONLY);

  const { updates } = req.body; // [{ userId, isAdmin }]
  if (!Array.isArray(updates))
    throw errorHandler(400, MESSAGES.USER.INVALID_FORMAT);

  // Basic validation for each update object
  for (const u of updates) {
    if (!u.userId || typeof u.isAdmin !== "boolean") {
      throw errorHandler(
        400,
        MESSAGES.USER.INVALID_FORMAT
      );
    }
  }

  const updatePromises = updates.map((u) =>
    User.findOneAndUpdate({ _id: u.userId, isDeleted: { $ne: true } }, { isAdmin: u.isAdmin }, { new: true })
  );

  await Promise.all(updatePromises);
  res.status(200).json({ message: MESSAGES.USER.ADMINS_UPDATE_SUCCESS });
};
