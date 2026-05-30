import { Router } from "express";
import { paymentsController } from "./payments.controller";
import { optionalAuth } from "../../middlewares/auth";

const router = Router();

// Public endpoint to fetch Stripe publishable API key
router.get("/config", paymentsController.getStripeConfig);

// Create a Stripe checkout session; optional auth allows customer email when available
router.post(
  "/create-checkout-session",
  optionalAuth(),
  paymentsController.createStripeCheckoutSession
);

// Alias endpoint for checkout
router.post(
  "/checkout",
  optionalAuth(),
  paymentsController.createStripeCheckoutSession
);

export const paymentRouter = router;
