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

  const url = siteUrl(`/article/${encodeURIComponent(article.slug)}`);
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#1a2a4f;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-top:4px solid #D4A017;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
        <div style="font-size:11px;letter-spacing:2px;color:#D4A017;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">Habari Magazine</div>
        <h2 style="color:#1a2a4f;font-family:Georgia,serif;margin:0 0 12px;">Nouvel article : ${article.title}</h2>
        ${article.excerpt ? `<p style="color:#444;line-height:1.6;">${article.excerpt}</p>` : ""}
        <p style="margin:24px 0;text-align:center;"><a href="${url}" style="background:#1a2a4f;color:#D4A017;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;border:1px solid #D4A017;">Lire l'article</a></p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e5e5e5;"/>
        <p style="font-size:12px;color:#888;text-align:center;">Habari Magazine — <a href="${siteUrl("/mon-compte")}" style="color:#D4A017;">Gérer mes préférences</a></p>
      </div>
    </div>
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

  const url = siteUrl(isInvestment ? `/investisseurs` : `/appels-offres`);
  const typeLabel = isInvestment ? "Alerte investissement" : "Appel d'offres";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#1a2a4f;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-top:4px solid #D4A017;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
        <div style="font-size:11px;letter-spacing:2px;color:#D4A017;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">Habari Magazine</div>
        <h2 style="color:#1a2a4f;font-family:Georgia,serif;margin:0 0 12px;">${typeLabel} : ${opp.title}</h2>
        <p style="margin:24px 0;text-align:center;"><a href="${url}" style="background:#1a2a4f;color:#D4A017;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;border:1px solid #D4A017;">Voir l'opportunité</a></p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e5e5e5;"/>
        <p style="font-size:12px;color:#888;text-align:center;">Habari Magazine — <a href="${siteUrl("/mon-compte")}" style="color:#D4A017;">Gérer mes préférences</a></p>
      </div>
    </div>
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

  const url = siteUrl(`/evenements`);
  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#1a2a4f;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-top:4px solid #D4A017;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
        <div style="font-size:11px;letter-spacing:2px;color:#D4A017;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">Habari Magazine</div>
        <h2 style="color:#1a2a4f;font-family:Georgia,serif;margin:0 0 12px;">Nouvel événement : ${event.title}</h2>
        ${dateStr ? `<p style="color:#444;display:flex;align-items:center;gap:8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>${dateStr}</span></p>` : ""}
        <p style="margin:24px 0;text-align:center;"><a href="${url}" style="background:#1a2a4f;color:#D4A017;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;border:1px solid #D4A017;">Voir l'événement</a></p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e5e5e5;"/>
        <p style="font-size:12px;color:#888;text-align:center;">Habari Magazine — <a href="${siteUrl("/mon-compte")}" style="color:#D4A017;">Gérer mes préférences</a></p>
      </div>
    </div>
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
    const url = siteUrl(`/evenements`);
    const dateStr = new Date(event.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:linear-gradient(135deg,#f5f7fa 0%,#e8ecf1 100%);padding:32px 16px;">
        <div style="max-width:560px;margin:0 auto;padding:32px;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.8);border-radius:16px;box-shadow:0 8px 32px rgba(31,38,135,0.1);">
          <div style="font-size:11px;letter-spacing:2px;color:#D4A017;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">Habari Magazine</div>
          <h2 style="color:#1a2a4f;font-family:Georgia,serif;margin:0 0 12px;">Rappel : ${event.title} dans 3 jours</h2>
          <p style="color:#444;display:flex;align-items:center;gap:8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>${dateStr}</span></p>
          <p style="margin:24px 0;text-align:center;"><a href="${url}" style="background:#1a2a4f;color:#D4A017;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;border:1px solid #D4A017;">Voir l'événement</a></p>
          <hr style="margin-top:32px;border:none;border-top:1px solid #e5e5e5;"/>
          <p style="font-size:12px;color:#888;text-align:center;">Habari Magazine — <a href="${siteUrl("/mon-compte")}" style="color:#D4A017;">Gérer mes préférences</a></p>
        </div>
      </div>
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

  const { getUnsubscribeTokenByEmail } = await import("../db");
  const base = ENV.appUrl || siteUrl();

  for (const email of emails) {
    const token = await getUnsubscribeTokenByEmail(email);
    const unsubUrl = token
      ? `${base}/newsletter/desinscription?token=${token}`
      : `${base}/mon-compte`;
    const footer = `<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:12px;color:#777;text-align:center;font-family:Arial,sans-serif;">Vous recevez cet email car vous êtes abonné à la newsletter Habari Magazine.<br><a href="${unsubUrl}" style="color:#777;">Se désinscrire</a></p>`;
    await sendEmail({ to: email, subject, html: html + footer });
  }

  const subs = await getPushSubs(targets.map((u) => u.id));
  const expired = await sendBulkPush(subs, { title: subject, body: "Habari Magazine", url: siteUrl(), icon: siteUrl("/icon-192.png") });
  await cleanExpiredSubs(expired);

  return { sent: emails.length };
}

export async function countTargets(pref: NotifPreference, tier?: "premium" | "integral"): Promise<number> {
  const targets = await getUsersWithPref(pref, tier);
  return targets.length;
}
