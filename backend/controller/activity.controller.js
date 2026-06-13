import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { deleteFileFromR2 } from "../lib/r2.js";
import { initializeAttendanceForActivity } from "./attendance.controller.js";
import { MESSAGES } from "../constants/messages.js";

// helper to decide if activity is completed
const isCompleted = (activity) => {
  if (!activity.startDate || !activity.expectedDurationHours) return false;
  const end =
    new Date(activity.startDate).getTime() +
    activity.expectedDurationHours * 3600 * 1000;
  return Date.now() > end;
};

export const createActivity = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ACTIVITY.NOT_AUTHORIZED);

  const {
    title,
    poster,
    posterId,
    startDate,
    expectedDurationHours,
    description,
  } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  const creatorName = user.name || user.username;
  const creatorUsername = user.username;

  const newActivity = new Activity({
    title: title.trim(),
    poster,
    posterId: posterId || null,
    startDate: new Date(startDate),
    expectedDurationHours,
    description,
    createdBy: req.user.id,
    createdByName: creatorName,
    createdByUsername: creatorUsername,
    updatedBy: req.user.id,
    updatedByName: creatorName,
    updatedByUsername: creatorUsername,
    updateCount: 0,
    updateHistory: [],
  });

  const saved = await newActivity.save();

  // ✅ Create attendance records for all volunteers
  await initializeAttendanceForActivity(saved._id);

  res.status(201).json(saved);
};

export const getActivities = async (req, res) => {
  const activities = await Activity.find({ isDeleted: { $ne: true } })
    .populate("createdBy", "username")
    .populate("interestedUsers", "username")
    .sort({ startDate: 1 });

  const upcoming = [];
  const completed = [];

  activities.forEach((a) => {
    if (isCompleted(a)) completed.push(a);
    else upcoming.push(a);
  });

  res.status(200).json({ upcoming, completed });
};

export const getActivityById = async (req, res) => {
  const activity = await Activity.findOne({ _id: req.params.activityId, isDeleted: { $ne: true } })
    .populate("createdBy", "username")
    .populate("interestedUsers", "username")
    .populate("linkedPost");

  if (!activity) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);
  res.status(200).json({ activity });
};

export const updateActivity = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ACTIVITY.NOT_AUTHORIZED);

  const { activityId } = req.body;
  const existing = await Activity.findOne({ _id: activityId, isDeleted: { $ne: true } });
  if (!existing) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);

  const user = await User.findById(req.user.id);
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  const editorName = user.name || user.username;
  const editorUsername = user.username;

  const updateData = {
    title: req.body.title,
    poster: req.body.poster || existing.poster,
    posterId: req.body.posterId || existing.posterId,
    startDate: req.body.startDate
      ? new Date(req.body.startDate)
      : existing.startDate,
    expectedDurationHours:
      req.body.expectedDurationHours ?? existing.expectedDurationHours,
    description: req.body.description ?? existing.description,
    linkedPost: req.body.linkedPost || existing.linkedPost,
    updatedBy: req.user.id,
    updatedByName: editorName,
    updatedByUsername: editorUsername,
  };

  if (
    req.body.posterId &&
    existing.posterId &&
    req.body.posterId !== existing.posterId
  ) {
    try {
      await deleteFileFromR2(existing.posterId);
    } catch (err) {
      console.log("⚠️ Failed to delete old activity poster:", err.message);
    }
  }

  const updated = await Activity.findOneAndUpdate(
    { _id: activityId, isDeleted: { $ne: true } },
    {
      $set: updateData,
      $inc: { updateCount: 1 },
      $push: {
        updateHistory: {
          updatedBy: req.user.id,
          updatedByName: editorName,
          updatedByUsername: editorUsername,
          updatedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  res.status(200).json(updated);
};

export const deleteActivity = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ACTIVITY.NOT_AUTHORIZED);

  const { activityId } = req.body;
  const activity = await Activity.findOne({ _id: activityId, isDeleted: { $ne: true } });
  if (!activity) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);

  // Soft delete:
  activity.isDeleted = true;
  activity.deletedAt = new Date();
  await activity.save();

  res.status(200).json({ message: MESSAGES.ACTIVITY.DELETE_SUCCESS });
};

// toggle interest: user marks/unmarks interest
export const toggleInterest = async (req, res) => {
  const { activityId } = req.body;
  const activity = await Activity.findOne({ _id: activityId, isDeleted: { $ne: true } });
  if (!activity) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);

  const userId = req.user.id;
  const idx = activity.interestedUsers.findIndex(
    (id) => id.toString() === userId
  );

  if (idx === -1) {
    activity.interestedUsers.push(userId);
  } else {
    activity.interestedUsers.splice(idx, 1);
  }

  await activity.save();
  const isInterested = activity.interestedUsers.some(
    (id) => id.toString() === userId
  );
  res
    .status(200)
    .json({ interestedCount: activity.interestedUsers.length, isInterested });
};

// endpoint to get interested users for admin view (paginated optional)
export const getInterestedUsers = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ACTIVITY.NOT_AUTHORIZED);

  const activity = await Activity.findOne({ _id: req.params.activityId, isDeleted: { $ne: true } }).populate(
    "interestedUsers",
    "username email"
  );
  if (!activity) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);
  res.status(200).json({ interestedUsers: activity.interestedUsers });
};

export const linkNewsToActivity = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ACTIVITY.NOT_AUTHORIZED);

  const { activityId, newsId } = req.body;
  const activity = await Activity.findOne({ _id: activityId, isDeleted: { $ne: true } });
  if (!activity) throw errorHandler(404, MESSAGES.ACTIVITY.NOT_FOUND);

  activity.linkedPost = newsId;
  await activity.save();

  const updatedActivity = await Activity.findById(activity._id)
    .populate("linkedPost")
    .populate("createdBy", "username")
    .populate("interestedUsers", "username");

  res
    .status(200)
    .json({ message: MESSAGES.ACTIVITY.LINK_SUCCESS, activity: updatedActivity });
};
