import "dotenv/config";
import mongoose from "mongoose";
import path from "path";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../lib/r2.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Activity from "../models/activity.model.js";
import Poster from "../models/poster.model.js";

const R2_PUBLIC_URL = process.env.VITE_R2_PUBLIC_URL;

if (!R2_PUBLIC_URL) {
  console.error("❌ Error: VITE_R2_PUBLIC_URL is not set in backend/.env");
  process.exit(1);
}

// Helper to fetch all R2 keys and build a base name -> full key map
const getR2KeysMap = async () => {
  const map = new Map();
  let isTruncated = true;
  let continuationToken = undefined;

  console.log("📥 Fetching object keys from Cloudflare R2 bucket...");
  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });
    const response = await s3Client.send(command);
    if (response.Contents) {
      for (const item of response.Contents) {
        const key = item.Key;
        const baseName = path.parse(key).name; // e.g. "68d150580014454f0b35" from "68d150580014454f0b35.jpg"
        map.set(baseName, key);
      }
    }
    isTruncated = response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }
  console.log(`✅ Fetched ${map.size} files from R2.`);
  return map;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully for migration.");

    // Get the map of files currently in R2
    const r2KeysMap = await getR2KeysMap();

    // 1. Migrate Users
    const users = await User.find({
      $or: [
        { profilePicture: /cloud\.appwrite\.io/ },
        { profilePictureId: { $exists: true, $ne: null } }
      ]
    });
    let userCount = 0;
    for (const user of users) {
      const baseId = user.profilePictureId;
      if (baseId && !baseId.includes(".")) {
        const r2Key = r2KeysMap.get(baseId);
        if (r2Key) {
          user.profilePictureId = r2Key;
          user.profilePicture = `${R2_PUBLIC_URL}/${r2Key}`;
          await user.save();
          userCount++;
        } else if (user.profilePicture && user.profilePicture.includes("cloud.appwrite.io")) {
          // Fallback to .jpg if still on Appwrite
          const fallbackKey = `${baseId}.jpg`;
          user.profilePictureId = fallbackKey;
          user.profilePicture = `${R2_PUBLIC_URL}/${fallbackKey}`;
          await user.save();
          userCount++;
        }
      } else if (user.profilePicture && user.profilePicture.includes("cloud.appwrite.io")) {
        user.profilePicture = `${R2_PUBLIC_URL}/${baseId}`;
        await user.save();
        userCount++;
      }
    }
    console.log(`⚡ Successfully updated ${userCount} users.`);

    // 2. Migrate Posts
    const posts = await Post.find({
      $or: [
        { image: /cloud\.appwrite\.io/ },
        { imageId: { $exists: true, $ne: null } }
      ]
    });
    let postCount = 0;
    for (const post of posts) {
      const baseId = post.imageId;
      if (baseId && !baseId.includes(".")) {
        const r2Key = r2KeysMap.get(baseId);
        if (r2Key) {
          post.imageId = r2Key;
          post.image = `${R2_PUBLIC_URL}/${r2Key}`;
          await post.save();
          postCount++;
        } else if (post.image && post.image.includes("cloud.appwrite.io")) {
          const fallbackKey = `${baseId}.jpg`;
          post.imageId = fallbackKey;
          post.image = `${R2_PUBLIC_URL}/${fallbackKey}`;
          await post.save();
          postCount++;
        }
      } else if (post.image && post.image.includes("cloud.appwrite.io")) {
        post.image = `${R2_PUBLIC_URL}/${baseId}`;
        await post.save();
        postCount++;
      }
    }
    console.log(`⚡ Successfully updated ${postCount} posts.`);

    // 3. Migrate Activities
    const activities = await Activity.find({
      $or: [
        { poster: /cloud\.appwrite\.io/ },
        { posterId: { $exists: true, $ne: null } }
      ]
    });
    let activityCount = 0;
    for (const act of activities) {
      const baseId = act.posterId;
      if (baseId && !baseId.includes(".")) {
        const r2Key = r2KeysMap.get(baseId);
        if (r2Key) {
          act.posterId = r2Key;
          act.poster = `${R2_PUBLIC_URL}/${r2Key}`;
          await act.save();
          activityCount++;
        } else if (act.poster && act.poster.includes("cloud.appwrite.io")) {
          const fallbackKey = `${baseId}.jpg`;
          act.posterId = fallbackKey;
          act.poster = `${R2_PUBLIC_URL}/${fallbackKey}`;
          await act.save();
          activityCount++;
        }
      } else if (act.poster && act.poster.includes("cloud.appwrite.io")) {
        act.poster = `${R2_PUBLIC_URL}/${baseId}`;
        await act.save();
        activityCount++;
      }
    }
    console.log(`⚡ Successfully updated ${activityCount} activities.`);

    // 4. Migrate Posters
    const posters = await Poster.find({
      $or: [
        { media: /cloud\.appwrite\.io/ },
        { mediaId: { $exists: true, $ne: null } }
      ]
    });
    let posterCount = 0;
    for (const p of posters) {
      const baseId = p.mediaId;
      if (baseId && !baseId.includes(".")) {
        const r2Key = r2KeysMap.get(baseId);
        if (r2Key) {
          p.mediaId = r2Key;
          p.media = `${R2_PUBLIC_URL}/${r2Key}`;
          await p.save();
          posterCount++;
        } else if (p.media && p.media.includes("cloud.appwrite.io")) {
          const fallbackKey = `${baseId}.jpg`;
          p.mediaId = fallbackKey;
          p.media = `${R2_PUBLIC_URL}/${fallbackKey}`;
          await p.save();
          posterCount++;
        }
      } else if (p.media && p.media.includes("cloud.appwrite.io")) {
        p.media = `${R2_PUBLIC_URL}/${baseId}`;
        await p.save();
        posterCount++;
      }
    }
    console.log(`⚡ Successfully updated ${posterCount} posters.`);

    console.log("🎉 Database migration and healing completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    process.exit(1);
  }
};

migrate();
