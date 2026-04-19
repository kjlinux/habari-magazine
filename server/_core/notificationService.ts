import { getDb } from "../db";
import { users, pushSubscriptions } from "../../drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { sendEmail, sendBulkEmails } from "./email";
import { sendBulkPush, type PushPayload } from "./webpush";
import { ENV } from "./env";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getUsersWithPref(pref: keyof typeof users.$inferSelect, tier?: "premium" | "integral") {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(users[pref] as any, true), isNotNull(users.email)];
  if (tier) conditions.push(eq(users.subscriptionTier as any, tier));
  return db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(and(...conditions));
}

async function getPushSubs(userIds: number[]) {
  if (userIds.length === 0) return [];
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(pushSubscriptions)
    .where(
      userIds.length === 1
        ? eq(pushSubscriptions.userId, userIds[0])
        : undefined
    );
  return results.filter((s) => userIds.includes(s.userId));
}

async function cleanExpiredSubs(expiredIds: number[]) {
  if (expiredIds.length === 0) return;
  const db = await getDb();
  if (!db) return;
  for (const id of expiredIds) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
  }
}

function siteUrl(path = "") {
  return `${ENV.appUrl}${path}`;
}

// ── Article publié ───────────────────────────────────────────────────────────

export async function notifyNewArticle(article: {
  id: number;
  title: string;
  excerpt?: string | null;
  slug: string;
}) {
  const targets = await getUsersWithPref("notifNewArticles");
  if (targets.length === 0) return;

  const url = siteUrl(`/articles/${article.slug}`);
  const html = `
    <h2 style="color:#1a3c5e">Nouvel article : ${article.title}</h2>
    ${article.excerpt ? `<p>${article.excerpt}</p>` : ""}
    <a href="${url}" style="background:#1a3c5e;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:12px">Lire l'article</a>
    <hr style="margin-top:32px"/><p style="font-size:12px;color:#999">Habari Magazine — <a href="${siteUrl("/mon-compte")}">Gérer mes préférences</a></p>
  `;

  const emails = targets.map((u) => u.email!).filter(Boolean);
  await sendBulkEmails(emails, `Nouvel article : ${article.title}`, html);

  const pushPayload: PushPayload = {
    title: "Habari Magazine",
    body: article.title,
    url,
    icon: siteUrl("/icon-192.png"),
  };
  const subs = await getPushSubs(targets.map((u) => u.id));
  const expired = await sendBulkPush(subs, pushPayload);
  await cleanExpiredSubs(expired);
}

// ── Opportunité publiée ───────────────────────────────────────────────────────

export async function notifyNewOpportunity(opp: {
  id: number;
  title: string;
  type: string;
  slug?: string | null;
}) {
  const isInvestment = opp.type === "ami";
  const pref = isInvestment ? "notifInvestments" : "notifTenders";
  const targets = await getUsersWithPref(pref);
  if (targets.length === 0) return;

  const url = siteUrl(`/opportunites/${opp.slug ?? opp.id}`);
  const typeLabel = isInvestment ? "Alerte investissement" : "Appel d'offres";
  const html = `
    <h2 style="color:#1a3c5e">${typeLabel} : ${opp.title}</h2>
    <a href="${url}" style="background:#1a3c5e;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:12px">Voir l'opportunité</a>
    <hr style="margin-top:32px"/><p style="font-size:12px;color:#999">Habari Magazine — <a href="${siteUrl("/mon-compte")}">Gérer mes préférences</a></p>
  `;

  const emails = targets.map((u) => u.email!).filter(Boolean);
  await sendBulkEmails(emails, `${typeLabel} : ${opp.title}`, html);

  const subs = await getPushSubs(targets.map((u) => u.id));
  const expired = await sendBulkPush(subs, { title: typeLabel, body: opp.title, url, icon: siteUrl("/icon-192.png") });
  await cleanExpiredSubs(expired);
}

// ── Événement créé ────────────────────────────────────────────────────────────

export async function notifyNewEvent(event: {
  id: number;
  title: string;
  slug?: string | null;
  startDate?: Date | string | null;
}) {
  const targets = await getUsersWithPref("notifEvents");
  if (targets.length === 0) return;

  const url = siteUrl(`/evenements/${event.slug ?? event.id}`);
  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const html = `
    <h2 style="color:#1a3c5e">Nouvel événement : ${event.title}</h2>
    ${dateStr ? `<p>📅 ${dateStr}</p>` : ""}
    <a href="${url}" style="background:#1a3c5e;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:12px">Voir l'événement</a>
    <hr style="margin-top:32px"/><p style="font-size:12px;color:#999">Habari Magazine — <a href="${siteUrl("/mon-compte")}">Gérer mes préférences</a></p>
  `;

  const emails = targets.map((u) => u.email!).filter(Boolean);
  await sendBulkEmails(emails, `Événement : ${event.title}`, html);

  const subs = await getPushSubs(targets.map((u) => u.id));
  const expired = await sendBulkPush(subs, { title: "Nouvel événement", body: event.title, url, icon: siteUrl("/icon-192.png") });
  await cleanExpiredSubs(expired);
}

// ── Rappel événement (cron) ───────────────────────────────────────────────────

export async function sendEventReminders() {
  const db = await getDb();
  if (!db) return;

  const in3days = new Date();
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(0, 0, 0, 0);
  const in4days = new Date(in3days);
  in4days.setDate(in4days.getDate() + 1);

  const { events } = await import("../../drizzle/schema");
  const { between } = await import("drizzle-orm");

  const upcoming = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "upcoming"),
        between(events.startDate, in3days, in4days)
      )
    );

  if (upcoming.length === 0) return;

  const targets = await getUsersWithPref("notifEvents");
  if (targets.length === 0) return;

  for (const event of upcoming) {
    const url = siteUrl(`/evenements/${event.slug ?? event.id}`);
    const dateStr = new Date(event.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const html = `
      <h2 style="color:#1a3c5e">Rappel : ${event.title} dans 3 jours</h2>
      <p>📅 ${dateStr}</p>
      <a href="${url}" style="background:#1a3c5e;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:12px">Voir l'événement</a>
      <hr style="margin-top:32px"/><p style="font-size:12px;color:#999">Habari Magazine — <a href="${siteUrl("/mon-compte")}">Gérer mes préférences</a></p>
    `;
    const emails = targets.map((u) => u.email!).filter(Boolean);
    await sendBulkEmails(emails, `Rappel : ${event.title} dans 3 jours`, html);

    const subs = await getPushSubs(targets.map((u) => u.id));
    const expired = await sendBulkPush(subs, { title: "Rappel événement", body: `${event.title} — dans 3 jours`, url, icon: siteUrl("/icon-192.png") });
    await cleanExpiredSubs(expired);
  }
}

// ── Newsletter broadcast (admin manuel) ───────────────────────────────────────

export type NotifPreference = "notifNewsletter" | "notifNewArticles" | "notifInvestments" | "notifTenders" | "notifEvents";

export async function sendNewsletterBroadcast(
  subject: string,
  html: string,
  targetPref: NotifPreference,
  tier?: "premium" | "integral"
) {
  const targets = await getUsersWithPref(targetPref, tier);
  const emails = targets.map((u) => u.email!).filter(Boolean);
  await sendBulkEmails(emails, subject, html);

  const subs = await getPushSubs(targets.map((u) => u.id));
  const expired = await sendBulkPush(subs, { title: subject, body: "Habari Magazine", url: siteUrl(), icon: siteUrl("/icon-192.png") });
  await cleanExpiredSubs(expired);

  return { sent: emails.length };
}

export async function countTargets(pref: NotifPreference, tier?: "premium" | "integral"): Promise<number> {
  const targets = await getUsersWithPref(pref, tier);
  return targets.length;
}
