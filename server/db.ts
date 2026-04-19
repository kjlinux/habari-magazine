import { eq, desc, and, or, sql, count, like, sum, gte, lte } from "drizzle-orm";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import {
  InsertUser,
  users,
  articles,
  economicActors,
  investmentOpportunities,
  events,
  countries,
  callsForBids,
  subscriptionPlans,
  userSubscriptions,
  articleCategories,
  newsletterSubscribers,
  InsertNewsletterSubscriber,
  contactMessages,
  InsertContactMessage,
  magazineIssues,
  InsertMagazineIssue,
  opportunities,
  InsertOpportunity,
  magazinePurchases,
  siteSettings,
  authors,
  InsertAuthor,
  partners,
  InsertPartner,
  economicIndicators,
  InsertEconomicIndicator,
  EconomicIndicator,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: MySql2Database & { $client: Pool } | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 10 });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Article queries
 */
export async function getPublishedArticles(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy((t) => desc(t.publishedAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .limit(1);
  
  return result[0];
}

export async function getArticlesByCategory(categoryId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.categoryId, categoryId), eq(articles.status, 'published')))
    .orderBy((t) => desc(t.publishedAt))
    .limit(limit);
  
  return result;
}

export async function getArticlesByCountry(countryId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.countryId, countryId), eq(articles.status, 'published')))
    .orderBy((t) => desc(t.publishedAt))
    .limit(limit);
  
  return result;
}

/**
 * Economic actors queries
 */
export async function getEconomicActors(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(economicActors)
    .orderBy((t) => t.name)
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getEconomicActorBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(economicActors)
    .where(eq(economicActors.slug, slug))
    .limit(1);
  
  return result[0];
}

export async function getEconomicActorsByCountry(countryId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(economicActors)
    .where(eq(economicActors.countryId, countryId))
    .orderBy((t) => t.name)
    .limit(limit);
  
  return result;
}

export async function getEconomicActorsBySector(sector: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(economicActors)
    .where(eq(economicActors.sector, sector))
    .orderBy((t) => t.name)
    .limit(limit);
  
  return result;
}

/**
 * Investment opportunities queries
 */
export async function getOpenInvestmentOpportunities(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(investmentOpportunities)
    .where(eq(investmentOpportunities.status, 'open'))
    .orderBy((t) => desc(t.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getInvestmentOpportunitiesByCountry(countryId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(investmentOpportunities)
    .where(and(eq(investmentOpportunities.countryId, countryId), eq(investmentOpportunities.status, 'open')))
    .orderBy((t) => desc(t.createdAt))
    .limit(limit);
  
  return result;
}

/**
 * Events queries
 */
export async function getUpcomingEvents(limit: number = 10, includeExclusive: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  const statusCondition = or(eq(events.status, 'upcoming'), eq(events.status, 'ongoing'));
  const whereCondition = includeExclusive
    ? statusCondition
    : and(statusCondition, eq(events.isExclusive, false));

  const result = await db
    .select()
    .from(events)
    .where(whereCondition)
    .orderBy((t) => t.startDate)
    .limit(limit);

  return result;
}

/**
 * Countries queries
 */
export async function getAllCountries() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(countries)
    .orderBy((t) => t.name);
  
  return result;
}

export async function getCountryByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(countries)
    .where(eq(countries.code, code))
    .limit(1);
  
  return result[0];
}

/**
 * Calls for bids queries
 */
export async function getOpenCallsForBids(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(callsForBids)
    .where(eq(callsForBids.status, 'open'))
    .orderBy((t) => desc(t.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

/**
 * Subscription plans queries
 */
export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(subscriptionPlans)
    .orderBy((t) => t.monthlyPrice);
  
  return result;
}

export async function updateSubscriptionPlan(tier: "premium" | "integral", monthlyPrice: string, annualPrice: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptionPlans)
    .set({ monthlyPrice, annualPrice, updatedAt: new Date() })
    .where(eq(subscriptionPlans.tier, tier));
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, 'active')))
    .limit(1);
  
  return result[0];
}

/**
 * Newsletter queries
 */
export async function subscribeToNewsletter(data: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.insert(newsletterSubscribers).values(data).onDuplicateKeyUpdate({
    set: { tier: data.tier, status: 'active', name: data.name },
  });
  
  return { success: true };
}

export async function getNewsletterSubscription(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);
  
  return result[0];
}

export async function unsubscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db
    .update(newsletterSubscribers)
    .set({ status: 'unsubscribed' })
    .where(eq(newsletterSubscribers.email, email));
  
  return { success: true };
}

/**
 * Get articles by access level
 */
export async function getFreeArticles(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'published'), eq(articles.minSubscriptionTier, 'free')))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getPremiumArticles(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(articles)
    .where(and(
      eq(articles.status, 'published'),
      or(
        eq(articles.minSubscriptionTier, 'premium'),
        eq(articles.minSubscriptionTier, 'integral')
      )
    ))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

// ═══════════════════════════════════════════════════════════
// ADMIN HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Admin: Dashboard statistics
 */
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return {
    totalArticles: 0, publishedArticles: 0, draftArticles: 0,
    totalUsers: 0, totalSubscribers: 0, premiumSubscribers: 0,
    totalMagazineIssues: 0, totalDownloads: 0,
    recentArticles: [], monthlyRevenue: 0, activeSubscriptions: 0,
  };

  const [artTotal] = await db.select({ c: count() }).from(articles);
  const [artPublished] = await db.select({ c: count() }).from(articles).where(eq(articles.status, 'published'));
  const [artDraft] = await db.select({ c: count() }).from(articles).where(eq(articles.status, 'draft'));
  const [usrTotal] = await db.select({ c: count() }).from(users);
  const [nlTotal] = await db.select({ c: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, 'active'));
  const [nlPremium] = await db.select({ c: count() }).from(newsletterSubscribers).where(and(eq(newsletterSubscribers.tier, 'premium'), eq(newsletterSubscribers.status, 'active')));
  const [magTotal] = await db.select({ c: count() }).from(magazineIssues);
  const [magDownloads] = await db.select({ c: sum(magazineIssues.downloadCount) }).from(magazineIssues);

  const recentArticles = await db
    .select({ id: articles.id, title: articles.title, status: articles.status, minSubscriptionTier: articles.minSubscriptionTier, createdAt: articles.createdAt })
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(5);

  const [activeSubs] = await db.select({ c: count() }).from(userSubscriptions).where(eq(userSubscriptions.status, 'active'));

  // Revenue: approximate from download count only (no price column on magazineIssues)
  const [magRevenue] = await db.select({ c: sum(magazineIssues.downloadCount) }).from(magazineIssues);

  return {
    totalArticles: artTotal?.c ?? 0,
    publishedArticles: artPublished?.c ?? 0,
    draftArticles: artDraft?.c ?? 0,
    totalUsers: usrTotal?.c ?? 0,
    totalSubscribers: nlTotal?.c ?? 0,
    premiumSubscribers: nlPremium?.c ?? 0,
    totalMagazineIssues: magTotal?.c ?? 0,
    totalDownloads: Number(magDownloads?.c ?? 0),
    recentArticles,
    monthlyRevenue: Number(magRevenue?.c ?? 0),
    activeSubscriptions: activeSubs?.c ?? 0,
  };
}

/**
 * Admin: List ALL articles (including drafts)
 */
export async function adminGetAllArticles(limit: number = 50, offset: number = 0, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = statusFilter && statusFilter !== 'all'
    ? eq(articles.status, statusFilter as 'draft' | 'published' | 'archived')
    : undefined;

  const result = await db
    .select()
    .from(articles)
    .where(conditions)
    .orderBy(desc(articles.updatedAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Admin: Get article by ID (including drafts)
 */
export async function adminGetArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0];
}

/**
 * Admin: Create article
 */
export async function adminCreateArticle(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  authorId?: number;
  categoryId?: number;
  countryId?: number;
  featuredImage?: string;
  status?: 'draft' | 'published' | 'archived';
  minSubscriptionTier?: 'free' | 'premium' | 'integral';
}) {
  const db = await getDb();
  if (!db) return undefined;

  const publishedAt = data.status === 'published' ? new Date() : undefined;

  const result = await db.insert(articles).values({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? null,
    content: data.content,
    authorId: data.authorId ?? null,
    categoryId: data.categoryId ?? null,
    countryId: data.countryId ?? null,
    featuredImage: data.featuredImage ?? null,
    status: data.status ?? 'draft',
    minSubscriptionTier: data.minSubscriptionTier ?? 'free',
    publishedAt: publishedAt ?? null,
  });

  return { success: true, insertId: result[0].insertId };
}

/**
 * Admin: Update article
 */
export async function adminUpdateArticle(id: number, data: {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  authorId?: number | null;
  categoryId?: number | null;
  countryId?: number | null;
  featuredImage?: string | null;
  status?: 'draft' | 'published' | 'archived';
  minSubscriptionTier?: 'free' | 'premium' | 'integral';
}) {
  const db = await getDb();
  if (!db) return undefined;

  // If publishing for the first time, set publishedAt
  const updateData: Record<string, unknown> = { ...data };
  if (data.status === 'published') {
    const existing = await adminGetArticleById(id);
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  await db.update(articles).set(updateData).where(eq(articles.id, id));
  return { success: true };
}

/**
 * Admin: Delete article
 */
export async function adminDeleteArticle(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(articles).where(eq(articles.id, id));
  return { success: true };
}

/**
 * Admin: List all users
 */
export async function adminGetAllUsers(limit: number = 50, offset: number = 0, search?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = search
    ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
    : undefined;

  const result = await db
    .select()
    .from(users)
    .where(conditions)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Admin: Update user role
 */
export async function adminUpdateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { success: true };
}

/**
 * Admin: Update user subscription tier
 */
export async function adminUpdateUserSubscription(userId: number, tier: 'free' | 'premium' | 'integral') {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId));
  return { success: true };
}

/**
 * Admin: List newsletter subscribers
 */
export async function adminGetNewsletterSubscribers(limit: number = 50, offset: number = 0, tierFilter?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = tierFilter && tierFilter !== 'all'
    ? eq(newsletterSubscribers.tier, tierFilter as 'free' | 'premium')
    : undefined;

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(conditions)
    .orderBy(desc(newsletterSubscribers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Admin: Get article categories
 */
export async function adminGetCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(articleCategories).orderBy(articleCategories.name);
}

// ═══════════════════════════════════════════════════════════
// CONTACT MESSAGES HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Public: Submit a contact message
 */
export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: 'general' | 'editorial' | 'partnership' | 'advertising' | 'subscription' | 'other';
  priority?: 'normal' | 'priority';
}) {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(contactMessages).values({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    category: data.category ?? 'general',
    priority: data.priority ?? 'normal',
  });

  return { success: true };
}

/**
 * Admin: List all contact messages
 */
export async function adminGetContactMessages(limit: number = 50, offset: number = 0, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = statusFilter && statusFilter !== 'all'
    ? eq(contactMessages.status, statusFilter as 'new' | 'read' | 'replied' | 'archived')
    : undefined;

  return await db
    .select()
    .from(contactMessages)
    .where(conditions)
    .orderBy(desc(contactMessages.priority), desc(contactMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Admin: Get contact message by ID
 */
export async function adminGetContactMessageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return result[0];
}

/**
 * Admin: Update contact message status
 */
export async function adminUpdateContactMessageStatus(id: number, status: 'new' | 'read' | 'replied' | 'archived') {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = { status };
  if (status === 'replied') {
    updateData.repliedAt = new Date();
  }

  await db.update(contactMessages).set(updateData).where(eq(contactMessages.id, id));
  return { success: true };
}

/**
 * Admin: Count new (unread) contact messages
 */
export async function adminCountNewContactMessages() {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db.select({ c: count() }).from(contactMessages).where(eq(contactMessages.status, 'new'));
  return result?.c ?? 0;
}

/**
 * Admin: Delete contact message
 */
export async function adminDeleteContactMessage(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// MAGAZINE ISSUES HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Public: List published magazine issues
 */
export async function getPublishedMagazineIssues() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(magazineIssues)
    .where(eq(magazineIssues.isPublished, true))
    .orderBy(desc(magazineIssues.publishedAt));
}

/**
 * Public: Get a single magazine issue by number
 */
export async function getMagazineIssueByNumber(issueNumber: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(magazineIssues)
    .where(eq(magazineIssues.issueNumber, issueNumber))
    .limit(1);

  return result[0];
}

/**
 * Public: Increment download count
 */
export async function incrementMagazineDownloadCount(id: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(magazineIssues)
    .set({ downloadCount: sql`${magazineIssues.downloadCount} + 1` })
    .where(eq(magazineIssues.id, id));
}

/**
 * Admin: List all magazine issues (including unpublished)
 */
export async function adminGetAllMagazineIssues() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(magazineIssues)
    .orderBy(desc(magazineIssues.createdAt));
}

export async function getNextMagazineIssueNumber(): Promise<string> {
  const db = await getDb();
  if (!db) return "N°001";
  const all = await db.select({ issueNumber: magazineIssues.issueNumber }).from(magazineIssues);
  let max = 0;
  for (const row of all) {
    const match = row.issueNumber.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return `N°${String(max + 1).padStart(3, "0")}`;
}

/**
 * Admin: Get magazine issue by ID
 */
export async function adminGetMagazineIssueById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(magazineIssues)
    .where(eq(magazineIssues.id, id))
    .limit(1);

  return result[0];
}

/**
 * Admin: Create magazine issue
 */
export async function adminCreateMagazineIssue(data: {
  issueNumber: string;
  title: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  pdfFileKey?: string;
  coverFileKey?: string;
  pageCount?: number;
  isPremium?: boolean;
  isPublished?: boolean;
  sommaire?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const publishedAt = data.isPublished ? new Date() : null;

  const result = await db.insert(magazineIssues).values({
    issueNumber: data.issueNumber,
    title: data.title,
    description: data.description ?? null,
    coverUrl: data.coverUrl ?? null,
    pdfUrl: data.pdfUrl ?? null,
    pdfFileKey: data.pdfFileKey ?? null,
    coverFileKey: data.coverFileKey ?? null,
    pageCount: data.pageCount ?? null,
    isPremium: data.isPremium ?? true,
    isPublished: data.isPublished ?? false,
    publishedAt,
    sommaire: data.sommaire ?? null,
  });

  return { success: true, insertId: result[0].insertId };
}

/**
 * Admin: Update magazine issue
 */
export async function adminUpdateMagazineIssue(id: number, data: {
  issueNumber?: string;
  title?: string;
  description?: string | null;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  pdfFileKey?: string | null;
  coverFileKey?: string | null;
  pageCount?: number | null;
  isPremium?: boolean;
  isPublished?: boolean;
  sommaire?: string | null;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = { ...data };
  
  // If publishing for the first time, set publishedAt
  if (data.isPublished) {
    const existing = await adminGetMagazineIssueById(id);
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  await db.update(magazineIssues).set(updateData).where(eq(magazineIssues.id, id));
  return { success: true };
}

/**
 * Admin: Delete magazine issue
 */
export async function adminDeleteMagazineIssue(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(magazineIssues).where(eq(magazineIssues.id, id));
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// PUBLIC STATS HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Public: Get total registered user count (for social proof)
 */
export async function getTotalUserCount() {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db.select({ c: count() }).from(users);
  return result?.c ?? 0;
}


// ═══════════════════════════════════════════════════════════
// ARCHIVES HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Public: Get archived articles with filters (category, year, search)
 */
export async function getArchivedArticles(filters: {
  categoryId?: number;
  year?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { articles: [], total: 0 };

  const conditions = [eq(articles.status, "published")];

  if (filters.categoryId) {
    conditions.push(eq(articles.categoryId, filters.categoryId));
  }

  if (filters.year) {
    const startDate = new Date(`${filters.year}-01-01T00:00:00Z`);
    const endDate = new Date(`${filters.year + 1}-01-01T00:00:00Z`);
    conditions.push(gte(articles.publishedAt, startDate));
    conditions.push(lte(articles.publishedAt, endDate));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(articles.title, `%${filters.search}%`),
        like(articles.excerpt, `%${filters.search}%`)
      )!
    );
  }

  const whereClause = and(...conditions);
  const limit = filters.limit ?? 12;
  const offset = filters.offset ?? 0;

  const [totalResult, articlesResult] = await Promise.all([
    db.select({ c: count() }).from(articles).where(whereClause),
    db
      .select()
      .from(articles)
      .where(whereClause)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset),
  ]);

  return {
    articles: articlesResult,
    total: totalResult[0]?.c ?? 0,
  };
}

/**
 * Public: Get all available years from published articles
 */
export async function getArticleYears() {
  const db = await getDb();
  if (!db) return [];

  const yearExpr = sql<number>`YEAR(${articles.publishedAt})`;
  const result = await db
    .selectDistinct({ year: yearExpr })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(yearExpr));

  return result.map((r) => r.year).filter(Boolean);
}

/**
 * Public: Get all magazine issues for archives (published, ordered by date)
 */
export async function getArchivedMagazineIssues(filters: {
  year?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(magazineIssues.isPublished, true)];

  if (filters.year) {
    const startDate = new Date(`${filters.year}-01-01T00:00:00Z`);
    const endDate = new Date(`${filters.year + 1}-01-01T00:00:00Z`);
    conditions.push(gte(magazineIssues.publishedAt, startDate));
    conditions.push(lte(magazineIssues.publishedAt, endDate));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(magazineIssues.title, `%${filters.search}%`),
        like(magazineIssues.description, `%${filters.search}%`)
      )!
    );
  }

  return await db
    .select()
    .from(magazineIssues)
    .where(and(...conditions))
    .orderBy(desc(magazineIssues.publishedAt));
}

/**
 * User profile helpers
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      jobFunction: users.jobFunction,
      organization: users.organization,
      country: users.country,
      sector: users.sector,
      profileCompleted: users.profileCompleted,
      subscriptionTier: users.subscriptionTier,
      role: users.role,
      createdAt: users.createdAt,
      notifNewsletter: users.notifNewsletter,
      notifNewArticles: users.notifNewArticles,
      notifInvestments: users.notifInvestments,
      notifTenders: users.notifTenders,
      notifEvents: users.notifEvents,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserProfile(
  userId: number,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobFunction: string;
    organization: string;
    country?: string;
    sector?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      jobFunction: data.jobFunction,
      organization: data.organization,
      country: data.country || null,
      sector: data.sector || null,
      profileCompleted: true,
    })
    .where(eq(users.id, userId));

  return { success: true };
}

export async function isProfileCompleted(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ profileCompleted: users.profileCompleted })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 && result[0].profileCompleted === true;
}

export async function getUserNotificationPrefs(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      notifNewsletter: users.notifNewsletter,
      notifNewArticles: users.notifNewArticles,
      notifInvestments: users.notifInvestments,
      notifTenders: users.notifTenders,
      notifEvents: users.notifEvents,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserNotificationPrefs(
  userId: number,
  data: {
    notifNewsletter: boolean;
    notifNewArticles: boolean;
    notifInvestments: boolean;
    notifTenders: boolean;
    notifEvents: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// OPPORTUNITIES HELPERS (Appels d'offres, AMI, Emplois)
// ═══════════════════════════════════════════════════════════

/**
 * Public: List active opportunities by type
 */
export async function getActiveOpportunities(type?: 'bid' | 'ami' | 'job', limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(opportunities.status, 'active')];
  if (type) {
    conditions.push(eq(opportunities.type, type));
  }

  return await db
    .select()
    .from(opportunities)
    .where(and(...conditions))
    .orderBy(desc(opportunities.featured), desc(opportunities.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Public: Get opportunity by slug
 */
export async function getOpportunityBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.slug, slug))
    .limit(1);

  return result[0];
}

/**
 * Public: Count active opportunities by type
 */
export async function countActiveOpportunities() {
  const db = await getDb();
  if (!db) return { bids: 0, ami: 0, jobs: 0 };

  const [bids] = await db.select({ c: count() }).from(opportunities).where(and(eq(opportunities.status, 'active'), eq(opportunities.type, 'bid')));
  const [ami] = await db.select({ c: count() }).from(opportunities).where(and(eq(opportunities.status, 'active'), eq(opportunities.type, 'ami')));
  const [jobs] = await db.select({ c: count() }).from(opportunities).where(and(eq(opportunities.status, 'active'), eq(opportunities.type, 'job')));

  return { bids: bids?.c ?? 0, ami: ami?.c ?? 0, jobs: jobs?.c ?? 0 };
}

/**
 * Admin: List all opportunities (including draft/closed)
 */
export async function adminGetAllOpportunities(filters?: {
  type?: 'bid' | 'ami' | 'job';
  status?: 'active' | 'closed' | 'draft';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: ReturnType<typeof eq>[] = [];

  if (filters?.type) {
    conditions.push(eq(opportunities.type, filters.type));
  }
  if (filters?.status) {
    conditions.push(eq(opportunities.status, filters.status));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(opportunities.title, `%${filters.search}%`),
        like(opportunities.organization, `%${filters.search}%`)
      )! as any
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const [totalResult, items] = await Promise.all([
    db.select({ c: count() }).from(opportunities).where(whereClause),
    db
      .select()
      .from(opportunities)
      .where(whereClause)
      .orderBy(desc(opportunities.featured), desc(opportunities.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  return { items, total: totalResult[0]?.c ?? 0 };
}

/**
 * Admin: Get opportunity by ID
 */
export async function adminGetOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1);

  return result[0];
}

/**
 * Admin: Create opportunity
 */
export async function adminCreateOpportunity(data: {
  type: 'bid' | 'ami' | 'job';
  title: string;
  organization: string;
  country: string;
  sector?: string;
  description?: string;
  budget?: string;
  currency?: string;
  deadline?: string;
  amiType?: string;
  partners?: string;
  webinaire?: string;
  externalLink?: string;
  contractType?: string;
  experienceLevel?: string;
  featured?: boolean;
  status?: 'active' | 'closed' | 'draft';
}) {
  const db = await getDb();
  if (!db) return undefined;

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200) + "-" + Date.now().toString(36);

  const result = await db.insert(opportunities).values({
    type: data.type,
    title: data.title,
    slug,
    organization: data.organization,
    country: data.country,
    sector: data.sector ?? null,
    description: data.description ?? null,
    budget: data.budget ?? null,
    currency: data.currency ?? "USD",
    deadline: data.deadline ?? null,
    amiType: data.amiType ?? null,
    partners: data.partners ?? null,
    webinaire: data.webinaire ?? null,
    externalLink: data.externalLink ?? null,
    contractType: data.contractType ?? null,
    experienceLevel: data.experienceLevel ?? null,
    featured: data.featured ?? false,
    status: data.status ?? 'active',
  });

  return { success: true, insertId: result[0].insertId };
}

/**
 * Admin: Update opportunity
 */
export async function adminUpdateOpportunity(id: number, data: {
  type?: 'bid' | 'ami' | 'job';
  title?: string;
  organization?: string;
  country?: string;
  sector?: string | null;
  description?: string | null;
  budget?: string | null;
  currency?: string | null;
  deadline?: string | null;
  amiType?: string | null;
  partners?: string | null;
  webinaire?: string | null;
  externalLink?: string | null;
  contractType?: string | null;
  experienceLevel?: string | null;
  featured?: boolean;
  status?: 'active' | 'closed' | 'draft';
}) {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(opportunities).set(data).where(eq(opportunities.id, id));
  return { success: true };
}

/**
 * Admin: Delete opportunity
 */
export async function adminDeleteOpportunity(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(opportunities).where(eq(opportunities.id, id));
  return { success: true };
}

/**
 * Admin: Toggle featured status
 */
export async function adminToggleOpportunityFeatured(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await adminGetOpportunityById(id);
  if (!existing) return undefined;

  await db.update(opportunities).set({ featured: !existing.featured }).where(eq(opportunities.id, id));
  return { success: true, featured: !existing.featured };
}

/**
 * Admin: Count all opportunities (for dashboard stats)
 */
export async function adminCountOpportunities() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, draft: 0, closed: 0 };

  const [total] = await db.select({ c: count() }).from(opportunities);
  const [active] = await db.select({ c: count() }).from(opportunities).where(eq(opportunities.status, 'active'));
  const [draft] = await db.select({ c: count() }).from(opportunities).where(eq(opportunities.status, 'draft'));
  const [closed] = await db.select({ c: count() }).from(opportunities).where(eq(opportunities.status, 'closed'));

  return {
    total: total?.c ?? 0,
    active: active?.c ?? 0,
    draft: draft?.c ?? 0,
    closed: closed?.c ?? 0,
  };
}

/**
 * Password management
 */
export async function updateUserPassword(userId: number, newPasswordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));
}

/**
 * Magazine PDF purchases (one-time)
 */
export async function getMagazineIssueByPk(issueId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(magazineIssues).where(eq(magazineIssues.id, issueId)).limit(1);
  return result[0];
}

export async function hasUserPurchasedMagazine(userId: number, issueId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: magazinePurchases.id })
    .from(magazinePurchases)
    .where(
      and(
        eq(magazinePurchases.userId, userId),
        eq(magazinePurchases.issueId, issueId),
        eq(magazinePurchases.status, "paid"),
      ),
    )
    .limit(1);
  return result.length > 0;
}

export async function listUserMagazinePurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(magazinePurchases)
    .where(and(eq(magazinePurchases.userId, userId), eq(magazinePurchases.status, "paid")))
    .orderBy(desc(magazinePurchases.paidAt));
}

// ═══════════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════════

const DEFAULT_SETTINGS: Record<string, { value: string; label: string }> = {
  magazine_pdf_price: { value: "499", label: "Prix PDF magazine à l'unité (centimes)" },
};

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return DEFAULT_SETTINGS[key]?.value ?? null;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (rows.length > 0) return rows[0].value;
  return DEFAULT_SETTINGS[key]?.value ?? null;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return Object.entries(DEFAULT_SETTINGS).map(([key, v]) => ({ id: 0, key, value: v.value, label: v.label, updatedAt: new Date() }));
  const rows = await db.select().from(siteSettings);
  // Merge with defaults for any missing keys
  const result = [...rows];
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    if (!rows.find(r => r.key === key)) {
      result.push({ id: 0, key, value: def.value, label: def.label, updatedAt: new Date() });
    }
  }
  return result;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const label = DEFAULT_SETTINGS[key]?.label ?? key;
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value, label });
  }
}

// ═══════════════════════════════════════════════
// AUTHORS HELPERS
// ═══════════════════════════════════════════════

export async function adminGetAllAuthors() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(authors).orderBy(desc(authors.createdAt));
}

export async function adminGetAuthorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return result[0];
}

export async function adminCreateAuthor(data: {
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  specialization?: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(authors).values({
    name: data.name,
    email: data.email ?? null,
    bio: data.bio ?? null,
    avatar: data.avatar ?? null,
    specialization: data.specialization ?? null,
    userId: data.userId ?? null,
  });
  return { success: true, insertId: result[0].insertId };
}

export async function adminUpdateAuthor(id: number, data: {
  name?: string;
  email?: string | null;
  bio?: string | null;
  avatar?: string | null;
  specialization?: string | null;
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(authors).set(data).where(eq(authors.id, id));
  return { success: true };
}

export async function adminDeleteAuthor(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(authors).where(eq(authors.id, id));
  return { success: true };
}

// ═══════════════════════════════════════════════
// EVENTS HELPERS (Admin CRUD)
// ═══════════════════════════════════════════════

export async function adminGetAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).orderBy(desc(events.startDate));
}

export async function adminGetEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function adminCreateEvent(data: {
  title: string;
  slug: string;
  description?: string;
  type: 'conference' | 'webinar' | 'training' | 'workshop' | 'networking';
  startDate: Date;
  endDate?: Date;
  location?: string;
  countryId?: number;
  image?: string;
  capacity?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isExclusive?: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(events).values({
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    location: data.location ?? null,
    countryId: data.countryId ?? null,
    image: data.image ?? null,
    capacity: data.capacity ?? null,
    status: data.status ?? 'upcoming',
    isExclusive: data.isExclusive ?? false,
  });
  return { success: true, insertId: result[0].insertId };
}

export async function adminUpdateEvent(id: number, data: {
  title?: string;
  slug?: string;
  description?: string | null;
  type?: 'conference' | 'webinar' | 'training' | 'workshop' | 'networking';
  startDate?: Date;
  endDate?: Date | null;
  location?: string | null;
  countryId?: number | null;
  image?: string | null;
  capacity?: number | null;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(events).set(data).where(eq(events.id, id));
  return { success: true };
}

export async function adminDeleteEvent(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(events).where(eq(events.id, id));
  return { success: true };
}

// ---------- Helpers slug ----------
function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200) + "-" + Date.now().toString(36);
}

// ---------- Admin: Directory (economicActors) ----------
export async function adminGetAllActors(filters?: {
  sector?: string;
  countryId?: number;
  search?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: any[] = [];
  if (filters?.sector) conditions.push(eq(economicActors.sector, filters.sector));
  if (filters?.countryId) conditions.push(eq(economicActors.countryId, filters.countryId));
  if (typeof filters?.verified === "boolean") conditions.push(eq(economicActors.verified, filters.verified));
  if (filters?.search) conditions.push(like(economicActors.name, `%${filters.search}%`));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const [totalResult, items] = await Promise.all([
    db.select({ c: count() }).from(economicActors).where(whereClause),
    db.select().from(economicActors).where(whereClause).orderBy(desc(economicActors.createdAt)).limit(limit).offset(offset),
  ]);
  return { items, total: totalResult[0]?.c ?? 0 };
}

export async function adminGetActorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(economicActors).where(eq(economicActors.id, id)).limit(1);
  return r[0];
}

export async function adminCreateActor(data: {
  name: string;
  description?: string | null;
  sector?: string | null;
  subsector?: string | null;
  countryId?: number | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  foundedYear?: number | null;
  employees?: string | null;
  verified?: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const slug = buildSlug(data.name);
  const result = await db.insert(economicActors).values({
    name: data.name,
    slug,
    description: data.description ?? null,
    sector: data.sector ?? null,
    subsector: data.subsector ?? null,
    countryId: data.countryId ?? null,
    website: data.website ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    logo: data.logo ?? null,
    foundedYear: data.foundedYear ?? null,
    employees: data.employees ?? null,
    verified: data.verified ?? false,
  });
  return { success: true, insertId: result[0].insertId };
}

export async function adminUpdateActor(id: number, data: {
  name?: string;
  description?: string | null;
  sector?: string | null;
  subsector?: string | null;
  countryId?: number | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  foundedYear?: number | null;
  employees?: string | null;
  verified?: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(economicActors).set(data).where(eq(economicActors.id, id));
  return { success: true };
}

export async function adminDeleteActor(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(economicActors).where(eq(economicActors.id, id));
  return { success: true };
}

export async function adminToggleActorVerified(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await adminGetActorById(id);
  if (!existing) return undefined;
  const newValue = !existing.verified;
  await db.update(economicActors).set({ verified: newValue }).where(eq(economicActors.id, id));
  return { success: true, verified: newValue };
}

export async function adminCountActors() {
  const db = await getDb();
  if (!db) return { total: 0, verified: 0 };
  const [total] = await db.select({ c: count() }).from(economicActors);
  const [verified] = await db.select({ c: count() }).from(economicActors).where(eq(economicActors.verified, true));
  return { total: total?.c ?? 0, verified: verified?.c ?? 0 };
}

// ---------- Admin: Investments (investmentOpportunities) ----------
export async function adminGetAllInvestments(filters?: {
  investmentType?: 'equity' | 'debt' | 'grant' | 'partnership';
  status?: 'open' | 'closed' | 'funded';
  countryId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: any[] = [];
  if (filters?.investmentType) conditions.push(eq(investmentOpportunities.investmentType, filters.investmentType));
  if (filters?.status) conditions.push(eq(investmentOpportunities.status, filters.status));
  if (filters?.countryId) conditions.push(eq(investmentOpportunities.countryId, filters.countryId));
  if (filters?.search) conditions.push(like(investmentOpportunities.title, `%${filters.search}%`));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const [totalResult, items] = await Promise.all([
    db.select({ c: count() }).from(investmentOpportunities).where(whereClause),
    db.select().from(investmentOpportunities).where(whereClause).orderBy(desc(investmentOpportunities.createdAt)).limit(limit).offset(offset),
  ]);
  return { items, total: totalResult[0]?.c ?? 0 };
}

export async function adminGetInvestmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(investmentOpportunities).where(eq(investmentOpportunities.id, id)).limit(1);
  return r[0];
}

export async function adminCreateInvestment(data: {
  title: string;
  description: string;
  actorId?: number | null;
  countryId?: number | null;
  sector?: string | null;
  investmentType: 'equity' | 'debt' | 'grant' | 'partnership';
  targetAmount?: string | null;
  currency?: string | null;
  minInvestment?: string | null;
  expectedReturn?: string | null;
  timeline?: string | null;
  status?: 'open' | 'closed' | 'funded';
  image?: string | null;
  minSubscriptionTier?: 'free' | 'premium' | 'integral';
}) {
  const db = await getDb();
  if (!db) return undefined;
  const slug = buildSlug(data.title);
  const result = await db.insert(investmentOpportunities).values({
    title: data.title,
    slug,
    description: data.description,
    actorId: data.actorId ?? null,
    countryId: data.countryId ?? null,
    sector: data.sector ?? null,
    investmentType: data.investmentType,
    targetAmount: data.targetAmount ?? null,
    currency: data.currency ?? "USD",
    minInvestment: data.minInvestment ?? null,
    expectedReturn: data.expectedReturn ?? null,
    timeline: data.timeline ?? null,
    status: data.status ?? 'open',
    image: data.image ?? null,
    minSubscriptionTier: data.minSubscriptionTier ?? 'premium',
  });
  return { success: true, insertId: result[0].insertId };
}

export async function adminUpdateInvestment(id: number, data: {
  title?: string;
  description?: string;
  actorId?: number | null;
  countryId?: number | null;
  sector?: string | null;
  investmentType?: 'equity' | 'debt' | 'grant' | 'partnership';
  targetAmount?: string | null;
  currency?: string | null;
  minInvestment?: string | null;
  expectedReturn?: string | null;
  timeline?: string | null;
  status?: 'open' | 'closed' | 'funded';
  image?: string | null;
  minSubscriptionTier?: 'free' | 'premium' | 'integral';
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(investmentOpportunities).set(data).where(eq(investmentOpportunities.id, id));
  return { success: true };
}

export async function adminDeleteInvestment(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(investmentOpportunities).where(eq(investmentOpportunities.id, id));
  return { success: true };
}

export async function adminCountInvestments() {
  const db = await getDb();
  if (!db) return { total: 0, open: 0, closed: 0, funded: 0 };
  const [total] = await db.select({ c: count() }).from(investmentOpportunities);
  const [open] = await db.select({ c: count() }).from(investmentOpportunities).where(eq(investmentOpportunities.status, 'open'));
  const [closed] = await db.select({ c: count() }).from(investmentOpportunities).where(eq(investmentOpportunities.status, 'closed'));
  const [funded] = await db.select({ c: count() }).from(investmentOpportunities).where(eq(investmentOpportunities.status, 'funded'));
  return {
    total: total?.c ?? 0,
    open: open?.c ?? 0,
    closed: closed?.c ?? 0,
    funded: funded?.c ?? 0,
  };
}

// ---------- Public: Partners ----------
export async function getPublishedPartners(filters?: {
  category?: 'communique' | 'sponsored' | 'report';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(partners.published, true)];
  if (filters?.category) conditions.push(eq(partners.category, filters.category));
  return db
    .select()
    .from(partners)
    .where(and(...conditions))
    .orderBy(desc(partners.featured), desc(partners.publishedAt), desc(partners.createdAt))
    .limit(filters?.limit ?? 30)
    .offset(filters?.offset ?? 0);
}

export async function getPartnerBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(partners).where(eq(partners.slug, slug)).limit(1);
  return r[0];
}

// ---------- Admin: Partners ----------
export async function adminGetAllPartners(filters?: {
  category?: 'communique' | 'sponsored' | 'report';
  published?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: any[] = [];
  if (filters?.category) conditions.push(eq(partners.category, filters.category));
  if (typeof filters?.published === "boolean") conditions.push(eq(partners.published, filters.published));
  if (filters?.search) conditions.push(like(partners.title, `%${filters.search}%`));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const [totalResult, items] = await Promise.all([
    db.select({ c: count() }).from(partners).where(whereClause),
    db.select().from(partners).where(whereClause).orderBy(desc(partners.featured), desc(partners.createdAt)).limit(limit).offset(offset),
  ]);
  return { items, total: totalResult[0]?.c ?? 0 };
}

export async function adminGetPartnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return r[0];
}

export async function adminCreatePartner(data: {
  title: string;
  category: 'communique' | 'sponsored' | 'report';
  source?: string | null;
  excerpt?: string | null;
  content?: string | null;
  tag?: string | null;
  image?: string | null;
  externalLink?: string | null;
  featured?: boolean;
  published?: boolean;
  publishedAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const slug = buildSlug(data.title);
  const result = await db.insert(partners).values({
    title: data.title,
    slug,
    category: data.category,
    source: data.source ?? null,
    excerpt: data.excerpt ?? null,
    content: data.content ?? null,
    tag: data.tag ?? null,
    image: data.image ?? null,
    externalLink: data.externalLink ?? null,
    featured: data.featured ?? false,
    published: data.published ?? true,
    publishedAt: data.publishedAt ?? new Date(),
  });
  return { success: true, insertId: result[0].insertId };
}

export async function adminUpdatePartner(id: number, data: {
  title?: string;
  category?: 'communique' | 'sponsored' | 'report';
  source?: string | null;
  excerpt?: string | null;
  content?: string | null;
  tag?: string | null;
  image?: string | null;
  externalLink?: string | null;
  featured?: boolean;
  published?: boolean;
  publishedAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(partners).set(data).where(eq(partners.id, id));
  return { success: true };
}

export async function adminDeletePartner(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(partners).where(eq(partners.id, id));
  return { success: true };
}

export async function adminTogglePartnerFeatured(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await adminGetPartnerById(id);
  if (!existing) return undefined;
  const newValue = !existing.featured;
  await db.update(partners).set({ featured: newValue }).where(eq(partners.id, id));
  return { success: true, featured: newValue };
}

/**
 * Investment stats aggregation
 */
export async function getInvestmentStats() {
  const db = await getDb();
  if (!db) return { totalAmount: "0", activeCount: 0, sectorCount: 0 };

  const [totals] = await db
    .select({
      totalAmount: sql<string>`COALESCE(SUM(CAST(${investmentOpportunities.targetAmount} AS DECIMAL(15,2))), 0)`,
      activeCount: sql<number>`COUNT(*)`,
    })
    .from(investmentOpportunities)
    .where(eq(investmentOpportunities.status, "open"));

  const [sectors] = await db
    .select({ sectorCount: sql<number>`COUNT(DISTINCT ${investmentOpportunities.sector})` })
    .from(investmentOpportunities)
    .where(eq(investmentOpportunities.status, "open"));

  const totalUsd = parseFloat(totals?.totalAmount ?? "0");
  const formatted = totalUsd >= 1_000_000
    ? `${(totalUsd / 1_000_000).toFixed(1)}M`
    : totalUsd >= 1_000
    ? `${(totalUsd / 1_000).toFixed(0)}K`
    : totalUsd.toFixed(0);

  return {
    totalAmount: formatted,
    activeCount: Number(totals?.activeCount ?? 0),
    sectorCount: Number(sectors?.sectorCount ?? 0),
  };
}

/**
 * Economic indicators queries
 */
export async function getEconomicIndicators() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(economicIndicators)
    .orderBy(economicIndicators.sortOrder);
}

export async function adminGetAllEconomicIndicators() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(economicIndicators).orderBy(economicIndicators.sortOrder);
}

export async function adminCreateEconomicIndicator(data: Omit<InsertEconomicIndicator, "id" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(economicIndicators).values(data);
  return { id: (result as any).insertId };
}

export async function adminUpdateEconomicIndicator(id: number, data: Partial<Omit<InsertEconomicIndicator, "id" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(economicIndicators).set(data).where(eq(economicIndicators.id, id));
  return { success: true };
}

export async function adminDeleteEconomicIndicator(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(economicIndicators).where(eq(economicIndicators.id, id));
  return { success: true };
}

