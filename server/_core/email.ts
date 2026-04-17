import { ENV } from "./env";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(ENV.emailApiKey);
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];
  await resend.emails.send({
    from: ENV.emailFrom,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

async function sendViaNodemailer(payload: EmailPayload): Promise<void> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
  });
  await transporter.sendMail({
    from: ENV.emailFrom,
    to: Array.isArray(payload.to) ? payload.to.join(",") : payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

async function sendViaSendGrid(payload: EmailPayload): Promise<void> {
  const sgMail = await import("@sendgrid/mail");
  sgMail.default.setApiKey(ENV.emailApiKey);
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];
  await sgMail.default.sendMultiple({
    from: ENV.emailFrom,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text ?? "",
  });
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!ENV.emailApiKey && ENV.emailProvider !== "nodemailer") {
    console.warn("[Email] EMAIL_API_KEY not set — skipping email send");
    return;
  }
  try {
    switch (ENV.emailProvider) {
      case "resend":
        await sendViaResend(payload);
        break;
      case "nodemailer":
        await sendViaNodemailer(payload);
        break;
      case "sendgrid":
        await sendViaSendGrid(payload);
        break;
      default:
        console.warn(`[Email] Unknown provider: ${ENV.emailProvider}`);
    }
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
  }
}

/** Send in batches to avoid rate limits */
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  html: string,
  batchSize = 50
): Promise<void> {
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await Promise.all(batch.map((to) => sendEmail({ to, subject, html })));
    if (i + batchSize < recipients.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}
