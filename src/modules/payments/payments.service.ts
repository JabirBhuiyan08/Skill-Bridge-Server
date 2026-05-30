import Stripe from "stripe";
import { stripe } from "../../lib/stripe";

export type CreateCheckoutSessionInput = {
  amount: number;
  currency?: string | undefined;
  successUrl: string;
  cancelUrl: string;
  productName?: string | undefined;
  quantity?: number | undefined;
  metadata?: Record<string, string> | undefined;
  customerEmail?: string | undefined;
  priceId?: string | undefined;
};

export const createCheckoutSession = async (
  data: CreateCheckoutSessionInput
): Promise<Stripe.Checkout.Session> => {
  const lineItems = data.priceId
    ? [
        {
          price: data.priceId,
          quantity: data.quantity ?? 1,
        },
      ]
    : [
        {
          price_data: {
            currency: data.currency ?? "usd",
            unit_amount: Math.round(data.amount * 100),
            product_data: {
              name: data.productName ?? "Booking payment",
            },
          },
          quantity: data.quantity ?? 1,
        },
      ];

  const params: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    allow_promotion_codes: true,
  };

  if (data.metadata) {
    params.metadata = data.metadata;
  }

  if (data.customerEmail) {
    params.customer_email = data.customerEmail;
  }

  return await stripe.checkout.sessions.create(params);
};

export const getStripePublishableKey = () => {
  return process.env.STRIPE_PUBLISHABLE_KEY || process.env.PUBLISHABLE_KEY || "";
};
