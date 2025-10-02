import Volunteer from "../models/volunteer.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

// Create volunteer
export const createVolunteer = async (req, res, next) => {
  try {
    const { name, batch, email, password, dob, picture, pictureId } = req.body;

    const hashed = bcryptjs.hashSync(password, 10);

    const volunteer = new Volunteer({
      name,
      batch,
      email,
      dob,
      picture,
      pictureId,
      password: hashed,
    });

    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// Get all volunteers
export const getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json(volunteers);
  } catch (error) {
    next(error);
  }
};

// Get single volunteer
export const getVolunteerById = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.volunteerId);
    if (!volunteer) return next(errorHandler(404, "Volunteer not found!"));
    res.status(200).json(volunteer);
  } catch (error) {
    next(error);
  }
};

// Delete volunteer
export const deleteVolunteer = async (req, res, next) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.volunteerId);
    res.status(200).json({ message: "Volunteer deleted" });
  } catch (error) {
    next(error);
  }
};

// Update volunteer
export const updateVolunteer = async (req, res, next) => {
  try {
    const { name, batch, email, password, dob } = req.body;

    const updateData = { name, batch, email, dob };

    if (password) {
      const hashed = bcryptjs.hashSync(password, 10);
      updateData.password = hashed;
    }

    const updated = await Volunteer.findByIdAndUpdate(
      req.params.volunteerId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return next(errorHandler(404, "Volunteer not found"));

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
