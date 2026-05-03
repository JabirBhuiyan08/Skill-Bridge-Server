import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { reviewRouter } from "./modules/review/review.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { tutorRouter } from "./modules/tutors/tutor.router";
import { availabilityRouter } from "./modules/availability/availability.route";
import { categoryRouter } from "./modules/categories/category.router";
import { userRouter } from "./modules/users/users.router";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import path from "path";
import qs from "qs";


const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));


app.use(cookieParser());
app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount BetterAuth directly
app.use("/api/auth", toNodeHandler(auth));

// Your other routes
app.use("/api/tutors", tutorRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);


app.get("/", (req, res) => {
    res.send("Hello, world!");
});

// Error handling middleware (must be after all routes)
app.use(errorHandler);

export default app;