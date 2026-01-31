
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

) => {
  return prisma.review.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
};
 


export const reviewService ={
    createReview
}