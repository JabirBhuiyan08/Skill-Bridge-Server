import express, { Router } from "express";
import { userController } from "./users.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), userController.getAllUsers);
router.post("/", auth(UserRole.ADMIN), userController.createUser);
router.put("/:id", auth(UserRole.ADMIN), userController.updateUser);
router.put("/profile/:id", auth(UserRole.ADMIN), userController.updateUserProfile);

export const userRouter: Router = router;