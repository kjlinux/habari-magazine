import { eq, desc, and, or, sql, count, like, sum, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  InsertMagazineIssue
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    const textFields = ["name", "email", "loginMethod"] as const;
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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
export async function getUpcomingEvents(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(events)
    .where(or(eq(events.status, 'upcoming'), eq(events.status, 'ongoing')))
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
        eq(articles.minSubscriptionTier, 'standard'),
        eq(articles.minSubscriptionTier, 'premium'),
        eq(articles.minSubscriptionTier, 'enterprise')
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
  if (!db) return { totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalUsers: 0, totalSubscribers: 0, premiumSubscribers: 0, totalMagazineIssues: 0, totalDownloads: 0 };

  const [artTotal] = await db.select({ c: count() }).from(articles);
  const [artPublished] = await db.select({ c: count() }).from(articles).where(eq(articles.status, 'published'));
  const [artDraft] = await db.select({ c: count() }).from(articles).where(eq(articles.status, 'draft'));
  const [usrTotal] = await db.select({ c: count() }).from(users);
  const [nlTotal] = await db.select({ c: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, 'active'));
  const [nlPremium] = await db.select({ c: count() }).from(newsletterSubscribers).where(and(eq(newsletterSubscribers.tier, 'premium'), eq(newsletterSubscribers.status, 'active')));
  const [magTotal] = await db.select({ c: count() }).from(magazineIssues);
  const [magDownloads] = await db.select({ c: sum(magazineIssues.downloadCount) }).from(magazineIssues);

  return {
    totalArticles: artTotal?.c ?? 0,
    publishedArticles: artPublished?.c ?? 0,
    draftArticles: artDraft?.c ?? 0,
    totalUsers: usrTotal?.c ?? 0,
    totalSubscribers: nlTotal?.c ?? 0,
    premiumSubscribers: nlPremium?.c ?? 0,
    totalMagazineIssues: magTotal?.c ?? 0,
    totalDownloads: Number(magDownloads?.c ?? 0),
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
  minSubscriptionTier?: 'free' | 'standard' | 'premium' | 'enterprise';
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
  minSubscriptionTier?: 'free' | 'standard' | 'premium' | 'enterprise';
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
export async function adminUpdateUserSubscription(userId: number, tier: 'free' | 'standard' | 'premium' | 'enterprise') {
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
}) {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(contactMessages).values({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    category: data.category ?? 'general',
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
    .orderBy(desc(contactMessages.createdAt))
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
