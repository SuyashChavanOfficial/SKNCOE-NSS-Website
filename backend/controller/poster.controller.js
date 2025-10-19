import Poster from "../models/poster.model.js";
import { storage } from "../lib/appwrite.js";
import { errorHandler } from "../utils/error.js";

// Get today's poster
export const getTodaysPoster = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const poster = await Poster.findOne({
      date: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({ poster });
  } catch (error) {
    next(error);
  }
};

// Add new poster (Admin only)
export const createPoster = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const { image, imageId, caption } = req.body;

    if (!image || !caption)
      return next(errorHandler(400, "Image and caption are required"));

    // Delete existing poster for today if exists
    const existingPoster = await Poster.findOne();
    if (existingPoster) {
      if (existingPoster.imageId) {
        try {
          await storage.deleteFile(
            process.env.APPWRITE_STORAGE_ID,
            existingPoster.imageId
          );
        } catch (err) {
          console.log("Failed to delete old poster image:", err.message);
        }
      }
      await Poster.findByIdAndDelete(existingPoster._id);
    }

    const newPoster = new Poster({ image, imageId, caption });
    const savedPoster = await newPoster.save();

    res.status(201).json(savedPoster);
  } catch (error) {
    next(error);
  }
};

// Delete poster by ID (Admin only)
export const deletePoster = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const poster = await Poster.findById(req.params.posterId);
    if (!poster) return next(errorHandler(404, "Poster not found"));

    if (poster.imageId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          poster.imageId
        );
      } catch (err) {
        console.log("Failed to delete poster image:", err.message);
      }
    }

    await Poster.findByIdAndDelete(req.params.posterId);
    res.status(200).json({ message: "Poster deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update poster by ID (Admin only)
export const updatePoster = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const { image, imageId, caption } = req.body;

    const poster = await Poster.findById(req.params.posterId);
    if (!poster) return next(errorHandler(404, "Poster not found"));

    // Delete old image if new one uploaded
    if (imageId && poster.imageId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          poster.imageId
        );
      } catch (err) {
        console.log("Failed to delete old poster image:", err.message);
      }
    }

    poster.image = image || poster.image;
    poster.imageId = imageId || poster.imageId;
    poster.caption = caption || poster.caption;

    const updatedPoster = await poster.save();
    res.status(200).json(updatedPoster);
  } catch (error) {
    next(error);
  }
};
