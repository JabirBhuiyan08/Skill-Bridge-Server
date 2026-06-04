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
import { statsRouter } from "./modules/users/stats.router";
import { paymentRouter } from "./modules/payments/payments.route";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import path from "path";
import qs from "qs";


const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));


app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));


app.use(cookieParser());

// Configure CORS with allowed origins
const allowedOrigins = [
  process.env.APP_URL, // Frontend URL from environment variable
  "http://localhost:3000", // Local development
  "http://localhost:3001", // Alternative local development
  "http://127.0.0.1:3000", // Local development alternative
  "https://assignment4frontend-gvu9.vercel.app", // Production frontend
  "https://assignment4frontend.vercel.app", // Alternative frontend URL
].filter((origin): origin is string => origin !== undefined && origin !== ""); // Remove any falsy values (undefined, empty string)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, log which origins are being rejected
      console.log(`CORS rejected origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(null, true); // Allow for now to debug, change to false in strict mode
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 hours
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
app.use("/api/stats", statsRouter);
app.use("/api/payments", paymentRouter);


app.get("/", (req, res) => {
    res.send("Hello, world!");
});

// Error handling middleware (must be after all routes)
app.use(errorHandler);

export default app;