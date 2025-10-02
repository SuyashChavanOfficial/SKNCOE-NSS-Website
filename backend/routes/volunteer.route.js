import express from "express";
import {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
  deleteVolunteer,
} from "../controller/volunteer.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Admin can create a volunteer
router.post("/create", verifyToken, (req, res, next) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Only admins can add volunteers" });
  createVolunteer(req, res, next);
});

// Admin can view all volunteers
router.get("/get", verifyToken, (req, res, next) => {
  if (!req.user.isAdmin)
    return res
      .status(403)
      .json({ message: "Only admins can view all volunteers" });
  getVolunteers(req, res, next);
});

// Volunteer/admin can fetch individual profile
router.get("/:volunteerId", verifyToken, (req, res, next) => {
  if (req.user.isAdmin || req.user.id === req.params.volunteerId) {
    return getVolunteerById(req, res, next);
  }
  return res
    .status(403)
    .json({ message: "Not authorized to view this volunteer" });
});

// Admin can delete a volunteer
router.delete("/delete/:volunteerId", verifyToken, (req, res, next) => {
  if (!req.user.isAdmin)
    return res
      .status(403)
      .json({ message: "Only admins can delete volunteers" });
  deleteVolunteer(req, res, next);
});

export default router;
