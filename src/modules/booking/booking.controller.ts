import { NextFunction, Request, Response } from "express"
import { bookingService } from "./booking.service"


const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("REQ BODY:", req.body);

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tutorId, duration, location } = req.body;
    if (!tutorId || !duration || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = await bookingService.createBooking({
      tutorId,
      duration,
      location
    }, user.id);

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const bookings = await bookingService.getBookings(user.id);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

const getSingleBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    const booking = await bookingService.getSingleBooking(id, user.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const bookingController ={
    createBooking,
    getBookings,
    getSingleBooking
}