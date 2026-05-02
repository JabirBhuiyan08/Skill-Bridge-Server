import express, { Router } from "express";
import { categoryController } from "./category.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router();

router.post("/", auth(UserRole.ADMIN, UserRole.TUTOR), categoryController.uploadCategory);
router.get("/", categoryController.getAllCategories);
router.put("/:id", auth(UserRole.ADMIN, UserRole.TUTOR), categoryController.updateCategory);
router.delete("/:id", auth(UserRole.ADMIN, UserRole.TUTOR), categoryController.deleteCategory);

export const categoryRouter: Router = router;
