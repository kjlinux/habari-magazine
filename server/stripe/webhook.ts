import type { Express, Request, Response } from "express";
import express from "express";
import { constructWebhookEvent } from "./stripe";
import { getDb } from "../db";
import { users, userSubscriptions, newsletterSubscribers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Register the Stripe webhook endpoint.
 * MUST be registered BEFORE express.json() to preserve raw body for signature verification.
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];

      if (!signature || typeof signature !== "string") {
        console.log("[Webhook] Missing stripe-signature header");
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event;
      try {
        event = constructWebhookEvent(req.body as Buffer, signature);
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as any;
            const userId = parseInt(session.metadata?.user_id || session.client_reference_id || "0");
            const productKey = session.metadata?.product_key;
            const stripeSubscriptionId = session.subscription;
            const stripeCustomerId = session.customer;

            if (!userId) {
              console.error("[Webhook] No user_id found in session metadata");
              break;
            }

            const db = await getDb();
            if (!db) break;

            // Update user's stripe customer ID
            if (stripeCustomerId) {
              await db.update(users)
                .set({ stripeCustomerId: stripeCustomerId as string })
                .where(eq(users.id, userId));
            }

            // Determine the subscription tier based on product key
            let tier: "standard" | "premium" | "enterprise" = "premium";
            if (productKey === "newsletterPremium") {
              // Newsletter premium only - upgrade newsletter subscriber
              const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
              if (userResult.length > 0 && userResult[0].email) {
                await db.update(newsletterSubscribers)
                  .set({ tier: "premium" })
                  .where(eq(newsletterSubscribers.email, userResult[0].email));
              }
              tier = "standard";
            } else if (productKey === "bundle") {
              tier = "premium";
              // Also upgrade newsletter
              const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
              if (userResult.length > 0 && userResult[0].email) {
                await db.update(newsletterSubscribers)
                  .set({ tier: "premium" })
                  .where(eq(newsletterSubscribers.email, userResult[0].email));
              }
            }

            // Update user subscription tier
            await db.update(users)
              .set({ subscriptionTier: tier })
              .where(eq(users.id, userId));

            // Create subscription record
            await db.insert(userSubscriptions).values({
              userId,
              tier,
              status: "active",
              stripeSubscriptionId: stripeSubscriptionId as string,
              stripeProductKey: productKey,
              startDate: new Date(),
            });

            console.log(`[Webhook] User ${userId} subscribed to ${productKey} (tier: ${tier})`);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const subscriptionId = subscription.id;

            const db = await getDb();
            if (!db) break;

            // Mark subscription as cancelled
            await db.update(userSubscriptions)
              .set({ status: "cancelled", endDate: new Date() })
              .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

            // Find the user and downgrade
            const subResult = await db.select()
              .from(userSubscriptions)
              .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId))
              .limit(1);

            if (subResult.length > 0) {
              await db.update(users)
                .set({ subscriptionTier: "free" })
                .where(eq(users.id, subResult[0].userId));
              console.log(`[Webhook] User ${subResult[0].userId} subscription cancelled`);
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            console.log(`[Webhook] Payment failed for invoice ${invoice.id}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err: any) {
        console.error(`[Webhook] Error processing ${event.type}:`, err.message);
      }

      return res.json({ received: true });
    }
  );
}
