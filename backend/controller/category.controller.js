import Category from "../models/category.model.js";
import { errorHandler } from "../utils/error.js";
import { MESSAGES } from "../constants/messages.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  res.status(200).json(categories);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) throw errorHandler(400, MESSAGES.CATEGORY.NAME_REQUIRED);

  const existing = await Category.findOne({ name, isDeleted: { $ne: true } });
  if (existing) throw errorHandler(400, MESSAGES.CATEGORY.EXISTS);

  const category = new Category({ name });
  await category.save();
  res.status(201).json(category);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.body;
  const category = await Category.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!category) throw errorHandler(404, MESSAGES.CATEGORY.NOT_FOUND);

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  res.status(200).json({ message: MESSAGES.CATEGORY.DELETE_SUCCESS });
};
