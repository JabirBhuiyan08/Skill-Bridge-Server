import { NextFunction, Request, Response } from "express"
import { tutorService } from "./tutor.service"
import { userService } from "../users/users.service"
import { UserRole } from "../../middlewares/auth"

const getAllTutors = async (req: Request, res: Response) => {
    try {
        const { category, minRating, search } = req.query;
        const filters = {
            category: category as string,
            minRating: minRating ? parseInt(minRating as string) : undefined,
            search: search as string
        };
        const tutors = await tutorService.getAllTutors({
            category: filters.category,
            search: filters.search,
            ...(filters.minRating !== undefined && { minRating: filters.minRating })
        });
        res.status(200).json(tutors);
    } catch (error) {
        // Log the actual error
        console.error("Error in getAllTutors:", error);
        res.status(500).json({
            error: "Failed to retrieve tutors",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

const createTutor = async (req: Request, res: Response) => {
    const { name, email, password, bio, phone } = req.body;
    try {
        // Create user with TUTOR role via userService
        const newUser = await userService.createUser({
            name,
            email,
            password,
            role: UserRole.TUTOR,
            phone
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create tutor" });
    }
}

const getSingleTutor = async (req: Request, res: Response) => {
    const tutorId = req.params.id;
    try {
        const tutor = await tutorService.getSingleTutor(tutorId as string);
        res.status(200).json(tutor);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve tutor" });
    }
}



const updateTutorProfile = async (req: Request, res: Response) => {
    const tutorId = req.params.id;  // Now this will work with /:id/profile
    const { name, email, phone } = req.body;
    try {
        const updatedTutor = await tutorService.updateTutorProfile(tutorId as string, { name, email, phone });
        res.status(200).json(updatedTutor);
    } catch (error) {
        res.status(500).json({ error: "Failed to update tutor profile" });
    }
}

const updateTutorAvailability = async (req: Request, res: Response) => {
    const tutorId = req.params.id || req.params.tutorId;
    const data = req.body;
    try {
        // Handle both single object and array of availability data
        const availabilityArray = Array.isArray(data) ? data : [data];

        const results = await Promise.all(
            availabilityArray.map(async (item) => {
                return await tutorService.updateTutorAvailability(tutorId as string, item);
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error updating/creating availability:", error);
        res.status(500).json({
            error: "Failed to process availability",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}

const updateAvailabilityById = async (req: Request, res: Response) => {
    const tutorId = req.params.id; // from /tutors/:id/availability/:availabilityId
    const availabilityId = req.params.availabilityId;
    const data = req.body;
    try {
        const result = await tutorService.updateAvailabilityById(tutorId as string, availabilityId as string, data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({
            error: "Failed to update availability",
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

const getTutorAvailability = async (req: Request, res: Response) => {
    const tutorId = req.params.id;
    try {
        const availability = await tutorService.getTutorAvailability(tutorId as string);
        res.status(200).json(availability);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve tutor availability" });
    }
}

const deleteTutorAvailability = async (req: Request, res: Response) => {
    const availabilityId = req.params.availabilityId;
    try {
        const deletedAvailability = await tutorService.deleteTutorAvailability(availabilityId as string);
        res.status(200).json(deletedAvailability);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete tutor availability" });
    }
}

export const tutorController = {
    getAllTutors,
    createTutor,
    getSingleTutor,
    updateTutorProfile,
    updateTutorAvailability,
    updateAvailabilityById,
    getTutorAvailability,
    deleteTutorAvailability
}