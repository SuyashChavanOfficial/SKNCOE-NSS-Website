// Upload file

import { ID } from "appwrite";
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
    return storage.getFileView(appwriteConfig.storageId, fileID);
  } catch (error) {
    console.log(error);
    return null;
  }
}
