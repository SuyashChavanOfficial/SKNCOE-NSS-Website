import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// Initialize S3 client for Cloudflare R2
export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a secure presigned upload URL for Cloudflare R2
 * @param {string} filename - original filename
 * @param {string} contentType - mime type of the file
 * @returns {Promise<{presignedUrl: string, key: string}>}
 */
export async function generateUploadPresignedUrl(filename, contentType) {
  // Extract and sanitize extension
  const extension = path.extname(filename).toLowerCase();
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
  const safeExtension = allowedExtensions.includes(extension) ? extension : ".jpg";

  // Generate unpredictable unique filename (UUID style) to prevent traversal or collisions
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const key = `${uniqueId}${safeExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 5 minutes (300 seconds)
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { presignedUrl, key };
}

/**
 * Deletes an object from Cloudflare R2 by key
 * @param {string} key - R2 Object key
 * @returns {Promise<void>}
 */
export async function deleteFileFromR2(key) {
  if (!key) return;
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
