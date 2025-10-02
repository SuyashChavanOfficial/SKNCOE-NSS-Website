import Attendance from "../models/attendance.model.js";
import Volunteer from "../models/volunteer.model.js";
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
    const { activityId, volunteerId, status } = req.body;

    if (!["present", "absent"].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }

    const updated = await Attendance.findOneAndUpdate(
      { volunteer: volunteerId, activity: activityId },
      { status },
      { new: true }
    ).populate("volunteer activity");

    if (!updated) return next(errorHandler(404, "Attendance record not found"));

    res.status(200).json(updated);
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
