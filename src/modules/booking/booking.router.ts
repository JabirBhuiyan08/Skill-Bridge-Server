import express, {Router} from "express"
import auth, { UserRole } from "../../middlewares/auth"
import { bookingController } from "./booking.controller"

const router = express.Router()

router.post(
    "/",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.createBooking
)

router.get(
    "/",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.getBookings
)

router.get(
    "/:id",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.getSingleBooking
)

export const bookingRouter: Router = router