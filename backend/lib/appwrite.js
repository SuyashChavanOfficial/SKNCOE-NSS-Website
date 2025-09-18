import "dotenv/config";
import { Client, Storage } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_URL) // e.g. https://cloud.appwrite.io/v1
  .setProject(process.env.APPWRITE_PROJECT_ID) // project ID
  .setKey(process.env.APPWRITE_API_KEY); // server API key

export const storage = new Storage(client);
