import express, {Router} from "express"
import auth, { UserRole, optionalAuth } from "../../middlewares/auth"
import { bookingController } from "./booking.controller"

const router = express.Router()

// Create booking - requires authentication
router.post(
    "/",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.createBooking
)

// Get all bookings - optional auth (unauthenticated can call, but get limited data)
router.get(
    "/",
    optionalAuth(),
    bookingController.getBookings
)

// Get single booking - optional auth
router.get(
    "/:id",
    optionalAuth(),
    bookingController.getSingleBooking
)

export const bookingRouter: Router = router