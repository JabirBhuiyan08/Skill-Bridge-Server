import express, { Router } from "express";
import { userController } from "./users.controller";
import auth, { UserRole, optionalAuth } from "../../middlewares/auth";

const router = express.Router();

// Get all users - optional auth (unauthenticated can call)
router.get("/", optionalAuth(), userController.getAllUsers);

// Create user - requires admin authentication
router.post("/", auth(UserRole.ADMIN), userController.createUser);

// Update user - requires admin authentication
router.put("/:id", auth(UserRole.ADMIN), userController.updateUser);

// Update user profile - requires admin authentication
router.put("/profile/:id", auth(UserRole.ADMIN), userController.updateUserProfile);

export const userRouter: Router = router;