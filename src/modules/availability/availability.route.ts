import { Router } from "express";
import { availabilityController } from "./availability.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Public routes - accessible by anyone
// GET /availability?tutorId=xxx — get all, optionally filtered by tutor
router.get("/", availabilityController.getAllAvailabilities);
// GET /availability/:id — get single slot
router.get("/:id", availabilityController.getAvailabilityById);

// Tutor routes - only tutors can access these
// POST /availability — create slots (tutorId in request body)
router.post("/", auth(UserRole.TUTOR), availabilityController.createAvailability);
// PUT /availability/:id — update a specific slot
router.put("/:id", auth(UserRole.TUTOR), availabilityController.updateAvailability);
// DELETE /availability/:id — delete a specific slot
router.delete("/:id", auth(UserRole.TUTOR), availabilityController.deleteAvailability);

export const availabilityRouter: Router = router;