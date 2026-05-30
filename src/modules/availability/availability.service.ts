import { prisma } from '../../lib/prisma';

// Helper function to resolve subjectId: if a Subject doesn't exist, 
// check if a Category exists with that ID and create a Subject from it.
// Also reuses an existing Subject that already maps to that Category.
const resolveSubjectId = async (subjectOrCategoryId: string): Promise<string> => {
  // Check if a Subject with this exact ID exists
  let subject = await prisma.subject.findUnique({
    where: { id: subjectOrCategoryId }
  });
  
  if (subject) {
    return subject.id;
  }
  
  // Check if a Subject already exists for this Category (categoryId matches)
  subject = await prisma.subject.findFirst({
    where: { categoryId: subjectOrCategoryId }
  });
  
  if (subject) {
    return subject.id;
  }
  
  // If no subject exists, try to find a category and create a subject from it
  const category = await prisma.category.findUnique({
    where: { id: subjectOrCategoryId }
  });
  
  if (category) {
    const newSubject = await prisma.subject.create({
      data: {
        categoryId: category.id,
        name: category.name,
        description: category.description || ''
      }
    });
    return newSubject.id;
  }
  
  // If no category or subject found, throw error
  throw new Error(`No subject or category found with ID: ${subjectOrCategoryId}`);
};

const resolveTutorId = async (tutorIdOrUserId: string): Promise<string> => {
  const tutorById = await prisma.tutor.findUnique({
    where: { id: tutorIdOrUserId }
  });
  if (tutorById) {
    return tutorById.userId;
  }

  const tutorByUserId = await prisma.tutor.findUnique({
    where: { userId: tutorIdOrUserId }
  });
  if (tutorByUserId) {
    return tutorByUserId.userId;
  }

  const user = await prisma.user.findUnique({
    where: { id: tutorIdOrUserId }
  });
  if (user && user.role === 'TUTOR') {
    return user.id;
  }

  throw new Error(`Tutor not found with id or userId: ${tutorIdOrUserId}`);
};

const createAvailability = async (data: {
  tutorId: string;
  subjectId: string;
  name: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: string;
  priceAmount?: number;
  currency?: string;
  isActive: boolean;
}) => {
  const resolvedTutorId = await resolveTutorId(data.tutorId);

  // Resolve subjectId - allows passing a category ID that will auto-create a Subject
  const resolvedSubjectId = await resolveSubjectId(data.subjectId);

  const result = await prisma.availability.create({
    data: {
      tutorId: resolvedTutorId,
      subjectId: resolvedSubjectId,
      name: data.name,
      description: data.description,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration,
      priceAmount: data.priceAmount ?? null,
      currency: data.currency ?? null,
      isActive: data.isActive,
    },
  });
  return result;
};

const getAllAvailabilities = async () => {
  const result = await prisma.availability.findMany({
    include: {
      tutor: true,
      subject: true,
    },
  });
  return result;
};

const getAvailabilityById = async (id: string) => {
  const result = await prisma.availability.findUnique({
    where: { id },
    include: {
      tutor: true,
      subject: true,
    },
  });
  return result;
};

const getAvailabilitiesByTutorId = async (tutorId: string) => {
  const resolvedTutorId = await resolveTutorId(tutorId);
  const result = await prisma.availability.findMany({
    where: { tutorId: resolvedTutorId },
    include: {
      tutor: true,
      subject: true,
    },
  });
  return result;
};

const updateAvailability = async (
  id: string,
  data: {
    tutorId?: string;
    subjectId?: string;
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    slotDuration?: string;
    priceAmount?: number;
    currency?: string;
    isActive?: boolean;
  }
) => {
  // If subjectId is provided, resolve it (allow category ID)
  let updateData: any = { ...data };
  if (data.subjectId) {
    updateData.subjectId = await resolveSubjectId(data.subjectId);
  }

  // If tutorId is being updated, resolve it to the underlying user ID
  if (data.tutorId) {
    updateData.tutorId = await resolveTutorId(data.tutorId);
  }

  const result = await prisma.availability.update({
    where: { id },
    data: updateData,
  });
  return result;
};

const deleteAvailability = async (id: string) => {
  const result = await prisma.availability.delete({
    where: { id },
  });
  return result;
};

export const availabilityService = {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  getAvailabilitiesByTutorId,
  updateAvailability,
  deleteAvailability,
};