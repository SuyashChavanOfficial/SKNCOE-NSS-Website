import Attendance from "../models/attendance.model.js";
import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { MESSAGES } from "../constants/messages.js";

// Create attendance records when new activity is added
export const initializeAttendanceForActivity = async (activityId) => {
  const volunteers = await User.find({ isVolunteer: true, isDeleted: { $ne: true } });

  if (volunteers.length === 0) {
    console.log("No volunteers found to initialize attendance for.");
    return;
  }

  const attendanceRecords = volunteers.map((v) => ({
    volunteer: v._id,
    activity: activityId,
    status: "absent",
  }));

  await Attendance.insertMany(attendanceRecords);
};

// ✅ Mark attendance
export const markAttendance = async (req, res) => {
  const updates = Array.isArray(req.body) ? req.body : [req.body];

  const results = await Promise.all(
    updates.map(async ({ volunteerId, activityId, status }) => {
      if (!["present", "absent"].includes(status)) {
        throw errorHandler(400, MESSAGES.ATTENDANCE.INVALID_STATUS);
      }
      return Attendance.findOneAndUpdate(
        { volunteer: volunteerId, activity: activityId },
        { status },
        { new: true, upsert: true }
      ).populate({
        path: "volunteer",
        match: { isDeleted: { $ne: true } }
      }).populate({
        path: "activity",
        match: { isDeleted: { $ne: true } }
      });
    })
  );

  const filteredResults = results.filter(r => r.volunteer && r.activity);
  res.status(200).json(filteredResults);
};

// ✅ Get attendance of one activity (all volunteers)
export const getAttendanceByActivity = async (req, res) => {
  const records = await Attendance.find({ activity: req.params.activityId })
    .populate({
      path: "volunteer",
      match: { isDeleted: { $ne: true } },
      select: "username batch email nssID profilePicture name",
    })
    .populate({
      path: "activity",
      match: { isDeleted: { $ne: true } },
      select: "title startDate",
    });

  const filteredRecords = records.filter(r => r.volunteer && r.activity);
  res.status(200).json(filteredRecords);
};

// ✅ Get attendance of one volunteer (all activities)
export const getAttendanceByVolunteer = async (req, res) => {
  const records = await Attendance.find({ volunteer: req.params.volunteerId })
    .populate({
      path: "volunteer",
      match: { isDeleted: { $ne: true } },
      select: "username batch email name",
    })
    .populate({
      path: "activity",
      match: { isDeleted: { $ne: true } },
      select: "title startDate",
    });

  const filteredRecords = records.filter(r => r.volunteer && r.activity);
  res.status(200).json(filteredRecords);
};

export const getAllAttendance = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.ATTENDANCE.NOT_AUTHORIZED);

  const allRecords = await Attendance.find()
    .populate({
      path: "volunteer",
      match: { isDeleted: { $ne: true } },
      select: "username batch email name",
    })
    .populate({
      path: "activity",
      match: { isDeleted: { $ne: true } },
      select: "title startDate",
    });

  const filteredRecords = allRecords.filter(r => r.volunteer && r.activity);
  res.status(200).json(filteredRecords);
};
