import Stripe from "stripe";
import { HABARI_PRODUCTS, type ProductKey, type PriceInterval } from "./products";

// Initialize Stripe with the restricted key (rk_...)
const stripeRestrictedKey = process.env.STRIPE_RESTRICTED_KEY;

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    if (!stripeRestrictedKey) {
      throw new Error("STRIPE_RESTRICTED_KEY is not configured");
    }
    stripe = new Stripe(stripeRestrictedKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripe;
}

/**
 * Create a Stripe Checkout Session for a subscription
 */
export async function createCheckoutSession(params: {
  productKey: ProductKey;
  interval: PriceInterval;
  userId: number;
  userEmail: string;
  userName?: string;
  origin: string;
  successPath?: string;
  cancelPath?: string;
}): Promise<{ url: string }> {
  const s = getStripe();
  const product = HABARI_PRODUCTS[params.productKey];
  const price = product.prices[params.interval];

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: price.currency,
          unit_amount: price.amount,
          recurring: {
            interval: price.interval,
          },
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.userEmail,
      customer_name: params.userName || "",
      product_key: params.productKey,
      price_interval: params.interval,
    },
    success_url: `${params.origin}${params.successPath || "/abonnements/succes"}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}${params.cancelPath || "/abonnements"}`,
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return { url: session.url };
}

/**
 * Verify and construct a Stripe webhook event
 */
export function constructWebhookEvent(
  body: Buffer,
  signature: string,
): Stripe.Event {
  const s = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return s.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Retrieve a checkout session with expanded data
 */
export async function getCheckoutSession(sessionId: string) {
  const s = getStripe();
  return s.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
}

/**
 * Cancel a Stripe subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const s = getStripe();
  return s.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  const s = getStripe();
  return s.subscriptions.retrieve(subscriptionId);
}
