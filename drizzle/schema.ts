import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  longtext,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "premium", "integral"]).default("free").notNull(),
  hasNewsletterPremium: boolean("hasNewsletterPremium").default(false).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  // Profile fields
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  jobFunction: varchar("jobFunction", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  country: varchar("country", { length: 255 }),
  sector: varchar("sector", { length: 255 }),
  profileCompleted: boolean("profileCompleted").default(false),
  // Notification preferences
  notifNewsletter: boolean("notifNewsletter").default(true).notNull(),
  notifNewArticles: boolean("notifNewArticles").default(true).notNull(),
  notifInvestments: boolean("notifInvestments").default(false).notNull(),
  notifTenders: boolean("notifTenders").default(false).notNull(),
  notifEvents: boolean("notifEvents").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Authors/Contributors table
 */
export const authors = mysqlTable("authors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 512 }),
  specialization: varchar("specialization", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = typeof authors.$inferInsert;

/**
 * Article categories
 */
export const articleCategories = mysqlTable("articleCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleCategory = typeof articleCategories.$inferSelect;
export type InsertArticleCategory = typeof articleCategories.$inferInsert;

/**
 * CEEAC countries (Afrique Centrale)
 */
export const countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  flag: varchar("flag", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * Magazine articles
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: longtext("content").notNull(),
  authorId: int("authorId").references(() => authors.id),
  categoryId: int("categoryId").references(() => articleCategories.id),
  countryId: int("countryId").references(() => countries.id),
  featuredImage: varchar("featuredImage", { length: 512 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  minSubscriptionTier: mysqlEnum("minSubscriptionTier", ["free", "premium", "integral"]).default("free").notNull(),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Economic actors directory
 */
export const economicActors = mysqlTable("economicActors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  description: longtext("description"),
  sector: varchar("sector", { length: 255 }),
  subsector: varchar("subsector", { length: 255 }),
  countryId: int("countryId").references(() => countries.id),
  website: varchar("website", { length: 512 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  logo: varchar("logo", { length: 512 }),
  foundedYear: int("foundedYear"),
  employees: varchar("employees", { length: 100 }),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EconomicActor = typeof economicActors.$inferSelect;
export type InsertEconomicActor = typeof economicActors.$inferInsert;

/**
 * Investment opportunities
 */
export const investmentOpportunities = mysqlTable("investmentOpportunities", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  description: longtext("description").notNull(),
  actorId: int("actorId").references(() => economicActors.id),
  countryId: int("countryId").references(() => countries.id),
  sector: varchar("sector", { length: 255 }),
  investmentType: mysqlEnum("investmentType", ["equity", "debt", "grant", "partnership"]).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  minInvestment: decimal("minInvestment", { precision: 15, scale: 2 }),
  expectedReturn: varchar("expectedReturn", { length: 100 }),
  timeline: varchar("timeline", { length: 255 }),
  status: mysqlEnum("status", ["open", "closed", "funded"]).default("open").notNull(),
  image: varchar("image", { length: 512 }),
  minSubscriptionTier: mysqlEnum("minSubscriptionTier", ["free", "premium", "integral"]).default("premium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestmentOpportunity = typeof investmentOpportunities.$inferSelect;
export type InsertInvestmentOpportunity = typeof investmentOpportunities.$inferInsert;

/**
 * Call for tenders/bids
 */
export const callsForBids = mysqlTable("callsForBids", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  description: longtext("description").notNull(),
  publisherId: int("publisherId").references(() => economicActors.id),
  countryId: int("countryId").references(() => countries.id),
  sector: varchar("sector", { length: 255 }),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["open", "closed", "awarded"]).default("open").notNull(),
  image: varchar("image", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CallForBids = typeof callsForBids.$inferSelect;
export type InsertCallForBids = typeof callsForBids.$inferInsert;

/**
 * Unified opportunities table (Appels d'offres, AMI/Partenariats, Emplois & Stages)
 * Managed via admin back-office
 */
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["bid", "ami", "job"]).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  organization: varchar("organization", { length: 512 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 255 }),
  description: longtext("description"),
  budget: varchar("budget", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  deadline: varchar("deadline", { length: 100 }),
  // AMI-specific fields
  amiType: varchar("amiType", { length: 100 }),
  partners: varchar("partners", { length: 512 }),
  webinaire: varchar("webinaire", { length: 512 }),
  externalLink: varchar("externalLink", { length: 1024 }),
  // Job-specific fields
  contractType: varchar("contractType", { length: 100 }),
  experienceLevel: varchar("experienceLevel", { length: 100 }),
  // Common fields
  featured: boolean("featured").default(false),
  status: mysqlEnum("status", ["active", "closed", "draft"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

/**
 * Events and trainings
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  description: longtext("description"),
  type: mysqlEnum("type", ["conference", "webinar", "training", "workshop", "networking"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 512 }),
  countryId: int("countryId").references(() => countries.id),
  organizerId: int("organizerId").references(() => economicActors.id),
  image: varchar("image", { length: 512 }),
  capacity: int("capacity"),
  registeredCount: int("registeredCount").default(0),
  status: mysqlEnum("status", ["upcoming", "ongoing", "completed", "cancelled"]).default("upcoming").notNull(),
  isExclusive: boolean("isExclusive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Subscription plans
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["premium", "integral"]).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annualPrice", { precision: 10, scale: 2 }),
  features: json("features"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscriptions
 */
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  planId: int("planId").references(() => subscriptionPlans.id),
  tier: mysqlEnum("tier", ["premium", "integral"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeProductKey: varchar("stripeProductKey", { length: 100 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  autoRenew: boolean("autoRenew").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Internal messaging
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").references(() => users.id).notNull(),
  recipientId: int("recipientId").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 512 }),
  content: longtext("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * User alerts/notifications
 */
export const userAlerts = mysqlTable("userAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: mysqlEnum("type", ["article", "investment", "bid", "event", "message"]).notNull(),
  keywords: json("keywords"),
  countries: json("countries"),
  sectors: json("sectors"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = typeof userAlerts.$inferInsert;

/**
 * User reading history
 */
export const readingHistory = mysqlTable("readingHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  articleId: int("articleId").references(() => articles.id),
  actorId: int("actorId").references(() => economicActors.id),
  opportunityId: int("opportunityId").references(() => investmentOpportunities.id),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

/**
 * User favorites/bookmarks
 */
export const userFavorites = mysqlTable("userFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  articleId: int("articleId").references(() => articles.id),
  actorId: int("actorId").references(() => economicActors.id),
  opportunityId: int("opportunityId").references(() => investmentOpportunities.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * Newsletter subscribers
 */
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  userId: int("userId").references(() => users.id),
  tier: mysqlEnum("tier", ["free", "premium"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * Contact messages from the About page form
 */
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  message: longtext("message").notNull(),
  category: mysqlEnum("category", ["general", "editorial", "partnership", "advertising", "subscription", "other"]).default("general").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["normal", "priority"]).default("normal").notNull(),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Magazine issues (PDF editions)
 */
export const magazineIssues = mysqlTable("magazineIssues", {
  id: int("id").autoincrement().primaryKey(),
  issueNumber: varchar("issueNumber", { length: 20 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  coverUrl: varchar("coverUrl", { length: 512 }),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  pdfFileKey: varchar("pdfFileKey", { length: 512 }),
  coverFileKey: varchar("coverFileKey", { length: 512 }),
  pageCount: int("pageCount"),
  isPremium: boolean("isPremium").default(true).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  sommaire: longtext("sommaire"),
  downloadCount: int("downloadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MagazineIssue = typeof magazineIssues.$inferSelect;
export type InsertMagazineIssue = typeof magazineIssues.$inferInsert;

/**
 * One-time PDF magazine purchases (4,99 €/numéro)
 */
export const magazinePurchases = mysqlTable("magazinePurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  issueId: int("issueId").references(() => magazineIssues.id).notNull(),
  issueNumber: varchar("issueNumber", { length: 20 }).notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("eur").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "paid", "refunded", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type MagazinePurchase = typeof magazinePurchases.$inferSelect;
export type InsertMagazinePurchase = typeof magazinePurchases.$inferInsert;

/**
 * Site settings (key/value store for admin-configurable values)
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  label: varchar("label", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Partners content (press releases, sponsored articles, reports)
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  category: mysqlEnum("category", ["communique", "sponsored", "report"]).notNull(),
  source: varchar("source", { length: 255 }),
  excerpt: text("excerpt"),
  content: longtext("content"),
  tag: varchar("tag", { length: 100 }),
  image: varchar("image", { length: 512 }),
  externalLink: varchar("externalLink", { length: 1024 }),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Web Push subscriptions (browser push notifications)
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

export const economicIndicators = mysqlTable("economicIndicators", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable").notNull(),
  delta: varchar("delta", { length: 50 }),
  category: mysqlEnum("category", ["macro", "commodity"]).default("macro").notNull(),
  periodLabel: varchar("periodLabel", { length: 100 }),
  sortOrder: int("sortOrder").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EconomicIndicator = typeof economicIndicators.$inferSelect;
export type InsertEconomicIndicator = typeof economicIndicators.$inferInsert;
