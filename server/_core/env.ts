export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  stripeRestrictedKey: process.env.STRIPE_RESTRICTED_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? "",
  // Email notifications
  emailProvider: (process.env.EMAIL_PROVIDER ?? "resend") as "resend" | "nodemailer" | "sendgrid",
  emailApiKey: process.env.EMAIL_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@habari-magazine.com",
  // SMTP (nodemailer only)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  // Web Push VAPID
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidEmail: process.env.VAPID_EMAIL ?? "contact@habari-magazine.com",
};
