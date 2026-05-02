import { prisma } from "../../lib/prisma"

type Tutor = {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

const getAllTutors = async (filters?: { category?: string; minRating?: number; search?: string }) => {
    const where: any = {
        role: "TUTOR"
    };

    // Apply search filter
    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    // Map to simple tutor format
    return users.map(u => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        bio: "",
        tutorSubjects: [],
        availabilities: [],
        averageRating: 0,
        reviewCount: 0
    }));
}

const getSingleTutor = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id: id, role: "TUTOR" },
    });
    
    if (!user) {
        throw new Error("Tutor not found");
    }
    
    return {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        bio: "",
        tutorSubjects: [],
        availabilities: [],
        averageRating: 0,
        reviewCount: 0
    };
}



const updateTutorProfile = async (id: string, data: { name: string, email: string, phone: string }) => {
    // First check if the user exists and is a tutor
    const existingUser = await prisma.user.findUnique({
        where: { id: id, role: "TUTOR" }
    });
    
    if (!existingUser) {
        throw new Error("Tutor not found");
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone
        }
    });
    
    return updatedUser;
}

const updateTutorAvailability = async (tutorId: string, data: { 
    subjectId: string, 
    name: string, 
    description: string, 
    dayOfWeek: string, 
    startTime: string, 
    endTime: string, 
    slotDuration: string,
    isActive?: boolean 
}) => {
    // Check if user exists and is a tutor
    const user = await prisma.user.findFirst({
        where: { id: tutorId, role: "TUTOR" }
    });
    
    if (!user) {
        throw new Error("Tutor not found");
    }
    
    // Ensure a Subject exists for this category (subjectId might be a categoryId)
    let subjectId = data.subjectId;
    
    // Check if a Subject with this subjectId exists
    let subject = await prisma.subject.findUnique({
        where: { id: data.subjectId }
    });
    
    // If no subject exists, try to find a category and create a subject from it
    if (!subject) {
        const category = await prisma.category.findUnique({
            where: { id: data.subjectId }
        });
        
        if (category) {
            // Create a subject from the category
            subject = await prisma.subject.create({
                data: {
                    categoryId: category.id,
                    name: category.name,
                    description: category.description || ''
                }
            });
            subjectId = subject.id;
        } else {
            // If still no subject/category, get the first available category
            const defaultCategory = await prisma.category.findFirst();
            
            if (defaultCategory) {
                subject = await prisma.subject.create({
                    data: {
                        categoryId: defaultCategory.id,
                        name: data.name || defaultCategory.name,
                        description: data.description || defaultCategory.description || ''
                    }
                });
            } else {
                // If no categories exist at all, throw an error
                throw new Error("No categories available. Please create a category first.");
            }
            subjectId = subject.id;
        }
    }
    
    // Check if availability already exists for this tutor and subject
    const existingAvailability = await prisma.availability.findFirst({
        where: {
            tutorId: tutorId,
            subjectId: subjectId
        }
    });
    
    if (existingAvailability) {
        const updatedAvailability = await prisma.availability.update({
            where: { id: existingAvailability.id },
            data: {
                name: data.name,
                description: data.description,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                slotDuration: data.slotDuration,
                isActive: data.isActive ?? true
            }
        });
        return updatedAvailability;
    } else {
        const newAvailability = await prisma.availability.create({
            data: {
                tutorId: tutorId,
                subjectId: subjectId,
                name: data.name,
                description: data.description,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                slotDuration: data.slotDuration,
                isActive: data.isActive ?? true
            }
        });
        return newAvailability;
    }
}

const updateAvailabilityById = async (tutorId: string, availabilityId: string, data: {
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    slotDuration?: string;
    isActive?: boolean;
}) => {
    // Verify the availability belongs to this tutor
    const existing = await prisma.availability.findFirst({
        where: { id: availabilityId, tutorId }
    });
    
    if (!existing) {
        throw new Error("Availability not found or not authorized");
    }
    
    const result = await prisma.availability.update({
        where: { id: availabilityId },
        data
    });
    return result;
}

const getTutorAvailability = async (tutorId: string) => {
    const availabilities = await prisma.availability.findMany({
        where: { tutorId: tutorId }
    });
    return availabilities;
}

const deleteTutorAvailability = async (availabilityId: string) => {
    const deletedAvailability = await prisma.availability.delete({
        where: { id: availabilityId }
    });
    return deletedAvailability;
}



export const tutorService = {
    getAllTutors,
    getSingleTutor,
    updateTutorProfile,
    updateTutorAvailability,
    updateAvailabilityById,
    getTutorAvailability,
    deleteTutorAvailability,
}