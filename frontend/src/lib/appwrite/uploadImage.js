// Upload file

import { ImageGravity } from "appwrite";
import { appwriteConfig, storage } from "./config";

export async function uploadFile(file) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageID,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// GET FILE URL
export async function getFilePreview(fileID) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageID,
      fileID,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if(!fileURL) throw Error

    return fileUrl
  } catch (error) {}
}
