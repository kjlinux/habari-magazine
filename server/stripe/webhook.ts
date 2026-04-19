import type { Express, Request, Response } from "express";
import express from "express";
import { constructWebhookEvent } from "./stripe";
import { getDb } from "../db";
import { users, userSubscriptions, newsletterSubscribers, magazinePurchases } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

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

            // ── One-time magazine PDF purchase ──
            if (session.metadata?.kind === "magazine_pdf") {
              const issueId = parseInt(session.metadata.issue_id || "0");
              const issueNumber = session.metadata.issue_number || "";
              if (!issueId) {
                console.error("[Webhook] magazine_pdf without issue_id");
                break;
              }
              await db.insert(magazinePurchases).values({
                userId,
                issueId,
                issueNumber,
                amount: session.amount_total ?? 499,
                currency: (session.currency as string) ?? "eur",
                stripeSessionId: session.id,
                stripePaymentIntentId: (session.payment_intent as string) ?? null,
                status: "paid",
                paidAt: new Date(),
              });
              console.log(`[Webhook] User ${userId} purchased magazine PDF ${issueNumber}`);
              break;
            }

            // Update user's stripe customer ID
            if (stripeCustomerId) {
              await db.update(users)
                .set({ stripeCustomerId: stripeCustomerId as string })
                .where(eq(users.id, userId));
            }

            let siteTier: "free" | "premium" | "integral" = "premium";
            let grantNewsletter = false;

            if (productKey === "newsletterPremium") {
              siteTier = "free";
              grantNewsletter = true;
            } else if (productKey === "premiumAccess") {
              siteTier = "premium";
              grantNewsletter = false;
            } else if (productKey === "bundle") {
              siteTier = "integral";
              grantNewsletter = true;
            }

            if (grantNewsletter) {
              const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
              if (userResult.length > 0 && userResult[0].email) {
                await db.update(newsletterSubscribers)
                  .set({ tier: "premium" })
                  .where(eq(newsletterSubscribers.email, userResult[0].email));
              }
            }

            await db.update(users)
              .set({ subscriptionTier: siteTier, hasNewsletterPremium: grantNewsletter })
              .where(eq(users.id, userId));

            if (siteTier !== "free") {
              await db.insert(userSubscriptions).values({
                userId,
                tier: siteTier,
                status: "active",
                stripeSubscriptionId: stripeSubscriptionId as string,
                stripeProductKey: productKey,
                startDate: new Date(),
              });
            }

            console.log(`[Webhook] User ${userId} subscribed to ${productKey} (siteTier: ${siteTier}, newsletter: ${grantNewsletter})`);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const subscriptionId = subscription.id;

            const db = await getDb();
            if (!db) break;

            // Find the user BEFORE cancelling so we have the userId
            const subResult = await db.select()
              .from(userSubscriptions)
              .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId))
              .limit(1);

            // Mark subscription as cancelled
            await db.update(userSubscriptions)
              .set({ status: "cancelled", endDate: new Date() })
              .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

            if (subResult.length > 0) {
              const cancelledProduct = subResult[0].stripeProductKey;
              const userId = subResult[0].userId;

              const updates: { subscriptionTier?: "free"; hasNewsletterPremium?: boolean } = {};
              if (cancelledProduct === "premiumAccess") {
                updates.subscriptionTier = "free";
              } else if (cancelledProduct === "bundle") {
                updates.subscriptionTier = "free";
                updates.hasNewsletterPremium = false;
              } else if (cancelledProduct === "newsletterPremium") {
                updates.hasNewsletterPremium = false;
              } else {
                updates.subscriptionTier = "free";
                updates.hasNewsletterPremium = false;
              }
              await db.update(users).set(updates).where(eq(users.id, userId));

              if (cancelledProduct === "bundle" || cancelledProduct === "newsletterPremium") {
                const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
                if (userRow.length > 0 && userRow[0].email) {
                  await db.update(newsletterSubscribers)
                    .set({ tier: "free" })
                    .where(eq(newsletterSubscribers.email, userRow[0].email));
                }
              }

              console.log(`[Webhook] User ${userId} subscription cancelled (product: ${cancelledProduct})`);
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
