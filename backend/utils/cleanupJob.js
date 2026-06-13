import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Activity from "../models/activity.model.js";
import Poster from "../models/poster.model.js";
import { deleteFileFromR2 } from "../lib/r2.js";

export const runR2CleanupJob = async () => {
  console.log("🧹 Running background R2 media cleanup job...");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 1. Cleanup User profile pictures
    const deletedUsers = await User.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo },
      profilePictureId: { $ne: null }
    });
    for (const u of deletedUsers) {
      console.log(`Deleting R2 image for soft-deleted user ${u._id}`);
      try {
        await deleteFileFromR2(u.profilePictureId);
      } catch (err) {
        console.error(`Error deleting user profile picture ${u.profilePictureId}:`, err.message);
      }
      u.profilePictureId = null;
      u.profilePicture = "https://cdn-icons-png.flaticon.com/128/149/149071.png"; // default
      await u.save();
    }

    // 2. Cleanup Post images
    const deletedPosts = await Post.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo },
      imageId: { $ne: null }
    });
    for (const p of deletedPosts) {
      console.log(`Deleting R2 image for soft-deleted post ${p._id}`);
      try {
        await deleteFileFromR2(p.imageId);
      } catch (err) {
        console.error(`Error deleting post image ${p.imageId}:`, err.message);
      }
      p.imageId = null;
      p.image = "";
      await p.save();
    }

    // 3. Cleanup Activity posters
    const deletedActivities = await Activity.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo },
      posterId: { $ne: null }
    });
    for (const a of deletedActivities) {
      console.log(`Deleting R2 poster for soft-deleted activity ${a._id}`);
      try {
        await deleteFileFromR2(a.posterId);
      } catch (err) {
        console.error(`Error deleting activity poster ${a.posterId}:`, err.message);
      }
      a.posterId = null;
      a.poster = "";
      await a.save();
    }

    // 4. Cleanup Poster media
    const deletedPosters = await Poster.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo },
      mediaId: { $ne: null }
    });
    for (const po of deletedPosters) {
      console.log(`Deleting R2 media for soft-deleted poster ${po._id}`);
      try {
        await deleteFileFromR2(po.mediaId);
      } catch (err) {
        console.error(`Error deleting poster media ${po.mediaId}:`, err.message);
      }
      po.mediaId = null;
      po.media = "";
      await po.save();
    }

    console.log("✅ R2 cleanup job completed.");
  } catch (error) {
    console.error("❌ R2 cleanup job failed:", error);
  }
};
