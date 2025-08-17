// Upload file

import { ID, ImageGravity } from "appwrite";
import { appwriteConfig, storage } from "./config";

export async function uploadFile(file) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// GET FILE URL
export async function getFileUrl(fileID) {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileID
      // 2000,
      // 2000,
      // ImageGravity.Top,
      // 100
    );

    if(!fileUrl) throw Error

    return fileUrl
  } catch (error) {}
}
