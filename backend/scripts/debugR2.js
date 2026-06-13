import "dotenv/config";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../lib/r2.js";

const debug = async () => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 20,
    });
    const response = await s3Client.send(command);
    console.log("R2 Bucket contents (first 20 keys):");
    if (response.Contents && response.Contents.length > 0) {
      response.Contents.forEach((item) => {
        console.log(`- Key: "${item.Key}", Size: ${item.Size} bytes`);
      });
    } else {
      console.log("No objects found in the bucket (it is empty!).");
    }
  } catch (error) {
    console.error("Failed to read R2 bucket:", error);
  }
};

debug();
