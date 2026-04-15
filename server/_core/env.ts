export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  stripeRestrictedKey: process.env.STRIPE_RESTRICTED_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
};
