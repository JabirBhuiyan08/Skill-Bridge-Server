import express, { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

// Public routes
router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getSingleTutor);

// Tutor self-management (with :id parameter)
router.put("/profile/:id", auth(UserRole.TUTOR), tutorController.updateTutorProfile);

// Admin endpoint for creating tutor (delegates to users service)
router.post("/", auth(UserRole.ADMIN), tutorController.createTutor);

export const tutorRouter: Router = router;