import { prisma } from "../../lib/prisma"

type CreateBookingInput = {
  duration: string
  location: string
  tutorId: string
}

const createBooking = async (
  data: CreateBookingInput,
  studentId: string
) => {
  return prisma.booking.create({
    data: {
      ...data,
      studentId,
      tutorId: data.tutorId,
    },
  });
};

const getBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      OR: [
        { studentId: userId },
        { tutorId: userId }
      ]
    },
  });
};

const getSingleBooking = async (bookingId: string, userId: string) => {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { studentId: userId },
        { tutorId: userId }
      ]
    },
  });
};

export const bookingService = {
  createBooking,
  getBookings,
  getSingleBooking,
};
