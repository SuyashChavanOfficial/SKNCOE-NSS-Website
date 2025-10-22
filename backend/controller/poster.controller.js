import Poster from "../models/poster.model.js";
import { storage } from "../lib/appwrite.js";
import { errorHandler } from "../utils/error.js";

// Get all posters (sorted by date, newest first)
export const getAllPosters = async (req, res, next) => {
  try {
    const posters = await Poster.find().sort({ date: -1 });
    res.status(200).json({ posters });
  } catch (error) {
    next(error);
  }
};

// Get today's poster (for backward compatibility)
export const getTodaysPoster = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const poster = await Poster.findOne({
      date: { $gte: today, $lt: tomorrow },
    }).sort({ date: -1 });

    res.status(200).json({ poster });
  } catch (error) {
    next(error);
  }
};

// Create poster (Admin only)
export const createPoster = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const { media, mediaId, mediaType, caption, date } = req.body;

    if (!media || !caption)
      return next(errorHandler(400, "Media and caption are required"));

    const newPoster = new Poster({
      media,
      mediaId,
      mediaType,
      caption,
      date: date ? new Date(date) : new Date(),
    });

    const savedPoster = await newPoster.save();
    res.status(201).json(savedPoster);
  } catch (error) {
    next(error);
  }
};

// Update poster by ID (Admin only)
export const updatePoster = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Not authorized"));

  try {
    const { media, mediaId, mediaType, caption, date } = req.body;
    const poster = await Poster.findById(req.params.posterId);
    if (!poster) return next(errorHandler(404, "Poster not found"));

    // Delete old media if new one uploaded
    if (mediaId && poster.mediaId && mediaId !== poster.mediaId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          poster.mediaId
        );
      } catch (err) {
        console.log("Failed to delete old media:", err.message);
      }
    }

    poster.media = media || poster.media;
    poster.mediaId = mediaId || poster.mediaId;
    poster.mediaType = mediaType || poster.mediaType;
    poster.caption = caption || poster.caption;
    poster.date = date ? new Date(date) : poster.date;

    const updatedPoster = await poster.save();
    res.status(200).json(updatedPoster);
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

    // Delete media from Appwrite storage
    if (poster.mediaId) {
      try {
        await storage.deleteFile(
          process.env.APPWRITE_STORAGE_ID,
          poster.mediaId
        );
      } catch (err) {
        console.log("Failed to delete poster media:", err.message);
      }
    }

    await Poster.findByIdAndDelete(req.params.posterId);
    res.status(200).json({ message: "Poster deleted successfully" });
  } catch (error) {
    next(error);
  }
};
