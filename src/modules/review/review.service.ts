import { prisma } from "../../lib/prisma";

type CreateReviewInput = {
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment?: string;
};

const createReview = async (
  data: CreateReviewInput,
  userId: string,
  userRole: string
) => {
  // Convert undefined to null for Prisma compatibility
  const reviewData = {
    bookingId: data.bookingId,
    rating: data.rating,
    comment: data.comment ?? null, // Convert undefined to null
  };

  // If user is a student, set studentId; if tutor, set tutorId
  if (userRole === "STUDENT") {
    return prisma.review.create({
      data: {
        ...reviewData,
        studentId: userId,
        tutorId: data.tutorId,
      },
    });
  } else if (userRole === "TUTOR") {
    return prisma.review.create({
      data: {
        ...reviewData,
        tutorId: userId,
        studentId: data.studentId,
      },
    });
  } else {
    // Default fallback - treat as student
    return prisma.review.create({
      data: {
        ...reviewData,
        studentId: userId,
        tutorId: data.tutorId,
      },
    });
  }
};

const getAllReview = async (filters?: { isApproved?: boolean; limit?: number }) => {
  const where: any = {};
  
  if (filters?.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  const allReview = await prisma.review.findMany({
    where,
    take: filters?.limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      student: {
        select: {
          name: true,
          email: true
        }
      },
      tutor: {
        select: {
          name: true
        }
      }
    }
  });
  
  return allReview;
};

export const reviewService = {
  createReview,
  getAllReview,
};