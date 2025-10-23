import Attendance from "../models/attendance.model.js";
import Activity from "../models/activity.model.js";
import { errorHandler } from "../utils/error.js";

// Create attendance records when new activity is added
export const initializeAttendanceForActivity = async (activityId) => {
  const volunteers = await Volunteer.find();
  const attendanceRecords = volunteers.map((v) => ({
    volunteer: v._id,
    activity: activityId,
    status: "absent",
  }));

  await Attendance.insertMany(attendanceRecords);
};

// ✅ Mark attendance
export const markAttendance = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [req.body];
    // each object: { volunteerId, activityId, status }

    const results = await Promise.all(
      updates.map(async ({ volunteerId, activityId, status }) => {
        if (!["present", "absent"].includes(status)) {
          throw errorHandler(400, "Invalid status");
        }
        return Attendance.findOneAndUpdate(
          { volunteer: volunteerId, activity: activityId },
          { status },
          { new: true, upsert: true } // upsert in case record does not exist
        ).populate("volunteer activity");
      })
    );

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// ✅ Get attendance of one activity (all volunteers)
export const getAttendanceByActivity = async (req, res, next) => {
  try {
    const records = await Attendance.find({ activity: req.params.activityId })
      .populate("volunteer", "name batch email")
      .populate("activity", "title startDate");

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// ✅ Get attendance of one volunteer (all activities)
export const getAttendanceByVolunteer = async (req, res, next) => {
  try {
    const records = await Attendance.find({ volunteer: req.params.volunteerId })
      .populate("volunteer", "name batch email")
      .populate("activity", "title startDate");

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    // Optional: only admins can fetch all
    if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

    const allRecords = await Attendance.find()
      .populate("volunteer", "name batch email")
      .populate("activity", "title startDate");

    res.status(200).json(allRecords);
  } catch (err) {
    next(err);
  }
};
