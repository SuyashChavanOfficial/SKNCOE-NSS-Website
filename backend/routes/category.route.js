import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../controller/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

export default router;
