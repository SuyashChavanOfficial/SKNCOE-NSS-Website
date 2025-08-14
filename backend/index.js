import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database is Connected");
    app.listen(3000, () => {
      console.log("Server is running on Port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Enable JSON request body parsing
app.use(express.json());

app.use("/api/auth", authRoutes);
