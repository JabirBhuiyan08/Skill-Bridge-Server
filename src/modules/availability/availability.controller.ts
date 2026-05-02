import { Request, Response, NextFunction } from "express";
import catchAsync from "../../shared/catchAsync";
import { availabilityService } from "./availability.service";
import { prisma } from "../../lib/prisma";

const createAvailability = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { slots } = req.body;
    const userId = req.user?.id;

    if (!userId || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        error: "Invalid request: authenticated user ID and slots array are required"
      });
    }

    // Validate that the User exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found. Please log in again."
      });
    }

    // Check if user has TUTOR role (optional: only tutors can create availability)
    if (user.role !== 'TUTOR') {
      return res.status(403).json({
        error: "Only tutors can create availability"
      });
    }

    // Also ensure Tutor record exists (create if missing)
    let tutor = await prisma.tutor.findUnique({
      where: { userId }
    });

    if (!tutor) {
      console.log(`⚠️  Tutor record missing for user ${userId}. Creating one...`);
      tutor = await prisma.tutor.create({
        data: {
          id: crypto.randomUUID(),
          userId: userId,
          name: req.user.name || 'Tutor',
          email: req.user.email || '',
          bio: ''
        }
      });
      console.log(`✅ Created Tutor record: ${tutor.id} for user ${userId}`);
    }

    const results = await Promise.all(
      slots.map(async (slot) => {
        return await availabilityService.createAvailability({ ...slot, tutorId: tutor.id });
      })
    );

    res.status(200).json(results);
  }
);

const getAllAvailabilities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tutorId } = req.query;
    let result;
    if (tutorId) {
      result = await availabilityService.getAvailabilitiesByTutorId(tutorId as string);
    } else {
      result = await availabilityService.getAllAvailabilities();
    }
    res.status(200).json(result);
  }
);

const getAvailabilityById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await availabilityService.getAvailabilityById(id as string);
    res.status(200).json(result);
  }
);

const getAvailabilitiesByTutorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tutorId } = req.params;
    const result = await availabilityService.getAvailabilitiesByTutorId(
      tutorId as string
    );
    res.status(200).json(result);
  }
);

const updateAvailability = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Verify ownership
    const existing = await availabilityService.getAvailabilityById(id as string);
    if (!existing) {
      return res.status(404).json({ error: "Availability not found" });
    }
    if (existing.tutorId !== req.user?.id) {
      return res.status(403).json({ error: "Not authorized to update this availability" });
    }
    const result = await availabilityService.updateAvailability(id as string, req.body);
    res.status(200).json(result);
  }
);

const deleteAvailability = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Verify ownership
    const existing = await availabilityService.getAvailabilityById(id as string);
    if (!existing) {
      return res.status(404).json({ error: "Availability not found" });
    }
    if (existing.tutorId !== req.user?.id) {
      return res.status(403).json({ error: "Not authorized to delete this availability" });
    }
    await availabilityService.deleteAvailability(id as string);
    res.status(200).json({ message: "Availability deleted successfully" });
  }
);

export const availabilityController = {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  getAvailabilitiesByTutorId,
  updateAvailability,
  deleteAvailability,
};
