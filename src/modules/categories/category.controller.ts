import { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.service";

const uploadCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const authorId = req.user?.id || '';
    const category = await categoryService.uploadCategory({
      name,
      description,
      authorId,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await categoryService.updateCategory(id as string, {
      name,
      description,
    });
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id as string);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const categoryController = {
  uploadCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
