import Poster from "../models/poster.model.js";
import { deleteFileFromR2 } from "../lib/r2.js";
import { errorHandler } from "../utils/error.js";
import { MESSAGES } from "../constants/messages.js";

// Get all posters (sorted by date, newest first)
export const getAllPosters = async (req, res) => {
  const posters = await Poster.find({ isDeleted: { $ne: true } }).sort({ date: -1 });
  res.status(200).json({ posters });
};

// Create poster (Admin only)
export const createPoster = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POSTER.NOT_AUTHORIZED);

  const { media, mediaId, mediaType, caption, date } = req.body;

  if (!media || !caption)
    throw errorHandler(400, MESSAGES.POSTER.FIELDS_REQUIRED);

  const newPoster = new Poster({
    media,
    mediaId,
    mediaType,
    caption,
    date: date ? new Date(date) : new Date(),
  });

  const savedPoster = await newPoster.save();
  res.status(201).json(savedPoster);
};

// Update poster by ID (Admin only)
export const updatePoster = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POSTER.NOT_AUTHORIZED);

  const { posterId, media, mediaId, mediaType, caption, date } = req.body;
  const poster = await Poster.findOne({ _id: posterId, isDeleted: { $ne: true } });
  if (!poster) throw errorHandler(404, MESSAGES.POSTER.NOT_FOUND);

  // Delete old media if new one uploaded
  if (mediaId && poster.mediaId && mediaId !== poster.mediaId) {
    try {
      await deleteFileFromR2(poster.mediaId);
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
};

// Delete poster by ID (Admin only)
export const deletePoster = async (req, res) => {
  if (!req.user.isAdmin) throw errorHandler(403, MESSAGES.POSTER.NOT_AUTHORIZED);

  const { posterId } = req.body;
  const poster = await Poster.findOne({ _id: posterId, isDeleted: { $ne: true } });
  if (!poster) throw errorHandler(404, MESSAGES.POSTER.NOT_FOUND);

  // Soft delete:
  poster.isDeleted = true;
  poster.deletedAt = new Date();
  await poster.save();

  res.status(200).json({ message: MESSAGES.POSTER.DELETE_SUCCESS });
};
