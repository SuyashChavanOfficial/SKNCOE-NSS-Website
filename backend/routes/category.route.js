import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../controller/category.controller.js";

import { validateSchema } from "../middleware/validate.js";
import { categorySchema, deleteCategorySchema } from "../validators/schemas.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", validateSchema(categorySchema), createCategory);
router.delete("/delete", validateSchema(deleteCategorySchema), deleteCategory);

export default router;
