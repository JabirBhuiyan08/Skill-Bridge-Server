import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { createCheckoutSession, getStripePublishableKey } from "./payments.service";

const createStripeCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("[PAYMENTS] Checkout request received", {
      body: req.body,
      headers: req.headers,
      url: req.originalUrl,
    });

    const {
      amount: amountRaw,
      currency,
      successUrl,
      cancelUrl,
      productName,
      quantity: quantityRaw,
      metadata,
    } = req.body;

    const amount = typeof amountRaw === "string" ? Number(amountRaw) : amountRaw;
    const quantity =
      quantityRaw == null
        ? 1
        : typeof quantityRaw === "string"
        ? Number(quantityRaw)
        : quantityRaw;

    const errors: string[] = [];
    if (amount == null || Number.isNaN(amount) || amount <= 0) {
      errors.push("amount is required and must be a positive number");
    }
    if (!successUrl || typeof successUrl !== "string") {
      errors.push("successUrl is required");
    }
    if (!cancelUrl || typeof cancelUrl !== "string") {
      errors.push("cancelUrl is required");
    }
    if (quantity == null || Number.isNaN(quantity) || quantity < 1) {
      errors.push("quantity must be a positive number");
    }

    if (errors.length > 0) {
      console.log("[PAYMENTS] Validation errors", errors);
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
        received: {
          amount: amountRaw,
          successUrl,
          cancelUrl,
          quantity: quantityRaw,
          body: req.body,
        },
      });
    }

    console.log("[PAYMENTS] Creating checkout session with:", {
      amount,
      currency,
      productName,
      quantity,
    });

    const session = await createCheckoutSession({
      amount,
      currency,
      successUrl,
      cancelUrl,
      productName,
      quantity,
      metadata: metadata as Record<string, string> | undefined,
      customerEmail: req.user?.email,
    });

    console.log("[PAYMENTS] Session created:", session.id);
    res.status(200).json({ sessionId: session.id, url: session.url });
  }
);

const getStripeConfig = catchAsync(async (req: Request, res: Response) => {
  const publishableKey = getStripePublishableKey();
  res.status(200).json({ publishableKey });
});

export const paymentsController = {
  createStripeCheckoutSession,
  getStripeConfig,
};
