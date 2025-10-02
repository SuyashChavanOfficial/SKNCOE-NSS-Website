import Activity from "../models/activity.model.js";
import { errorHandler } from "../utils/error.js";
import { storage } from "../lib/appwrite.js";
import { initializeAttendanceForActivity } from "./attendance.controller.js";

// helper to decide if activity is completed
const isCompleted = (activity) => {
  if (!activity.startDate || !activity.expectedDurationHours) return false;
  const end =
    new Date(activity.startDate).getTime() +
    activity.expectedDurationHours * 3600 * 1000;
  return Date.now() > end;
};

export const createActivity = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  const {
    title,
    poster,
    posterId,
    startDate,
    expectedDurationHours,
    description,
  } = req.body;
  if (!title || !poster || !startDate || expectedDurationHours == null)
    return next(errorHandler(400, "All fields are required"));

  try {
    const newActivity = new Activity({
      title: title.trim(),
      poster,
      posterId: posterId || null,
      startDate: new Date(startDate),
      expectedDurationHours,
      description,
      createdBy: req.user.id,
    });

    const saved = await newActivity.save();

    // ✅ Create attendance records for all volunteers
    await initializeAttendanceForActivity(saved._id);

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    // query params: upcoming=true/false or none => returns all grouped
    const activities = await Activity.find()
      .populate("createdBy", "username")
      .populate("interestedUsers", "username")
      .sort({ startDate: 1 });

    // split into upcoming and completed
    const upcoming = [];
    const completed = [];

    activities.forEach((a) => {
      if (isCompleted(a)) completed.push(a);
      else upcoming.push(a);
    });

    res.status(200).json({ upcoming, completed });
  } catch (error) {
    next(error);
  }
};

export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.activityId)
      .populate("createdBy", "username")
      .populate("interestedUsers", "username");
    if (!activity) return next(errorHandler(404, "Activity not found"));
    res.status(200).json({ activity });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const updateData = {
      title: req.body.title,
      poster: req.body.poster,
      posterId: req.body.posterId,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      expectedDurationHours: req.body.expectedDurationHours,
      description: req.body.description,
    };

    // deleteOldPosterId if provided (from client) - remove old file in storage
    if (req.body.deleteOldPosterId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          req.body.deleteOldPosterId
        );
      } catch (err) {
        console.log("Failed to delete old activity poster:", err.message);
      }
    }

    const updated = await Activity.findByIdAndUpdate(
      req.params.activityId,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const activity = await Activity.findById(req.params.activityId);
    if (!activity) return next(errorHandler(404, "Activity not found"));

    // delete poster in storage if present
    if (activity.posterId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          activity.posterId
        );
      } catch (err) {
        console.log("Failed to delete activity poster:", err.message);
      }
    }

    await Activity.findByIdAndDelete(req.params.activityId);
    res.status(200).json({ message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};

// toggle interest: user marks/unmarks interest
export const toggleInterest = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.activityId);
    if (!activity) return next(errorHandler(404, "Activity not found"));

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
    // return the updated count and whether current user is interested
    const isInterested = activity.interestedUsers.some(
      (id) => id.toString() === userId
    );
    res
      .status(200)
      .json({ interestedCount: activity.interestedUsers.length, isInterested });
  } catch (error) {
    next(error);
  }
};

// endpoint to get interested users for admin view (paginated optional)
export const getInterestedUsers = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));
  try {
    const activity = await Activity.findById(req.params.activityId).populate(
      "interestedUsers",
      "username email"
    );
    if (!activity) return next(errorHandler(404, "Activity not found"));
    res.status(200).json({ interestedUsers: activity.interestedUsers });
  } catch (error) {
    next(error);
  }
};
