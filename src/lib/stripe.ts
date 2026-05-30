import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing Stripe secret key. Set STRIPE_SECRET_KEY or SECRET_KEY in .env.");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-04-10",
});
