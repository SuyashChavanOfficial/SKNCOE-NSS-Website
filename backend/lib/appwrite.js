import "dotenv/config";
import { Client, Storage } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_URL)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const storage = new Storage(client);
