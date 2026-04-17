import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  canAccessArticle,
  getTrialDaysRemaining,
  hasActiveSubscription,
  isLaunchPeriod,
  stripPremiumContent,
  TRIAL_DURATION_DAYS,
} from "./_core/access";
import { createCheckoutSession, getCheckoutSession, cancelSubscription, createMagazinePdfCheckoutSession, getStripe } from "./stripe/stripe";
import { HABARI_PRODUCTS, MAGAZINE_PDF_PRICE, type ProductKey, type PriceInterval } from "./stripe/products";
import {
  getPublishedArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getArticlesByCountry,
  getEconomicActors,
  getEconomicActorBySlug,
  getEconomicActorsByCountry,
  getEconomicActorsBySector,
  getOpenInvestmentOpportunities,
  getInvestmentOpportunitiesByCountry,
  getUpcomingEvents,
  getAllCountries,
  getCountryByCode,
  getOpenCallsForBids,
  getSubscriptionPlans,
  getUserSubscription,
  subscribeToNewsletter,
  getNewsletterSubscription,
  unsubscribeNewsletter,
  getFreeArticles,
  getPremiumArticles,
  // Contact helpers
  submitContactMessage,
  adminGetContactMessages,
  adminGetContactMessageById,
  adminUpdateContactMessageStatus,
  adminCountNewContactMessages,
  adminDeleteContactMessage,
  // Magazine purchases
  getMagazineIssueByPk,
  hasUserPurchasedMagazine,
  listUserMagazinePurchases,
  // Settings helpers
  getAllSettings,
  getSetting,
  setSetting,
  // Admin helpers
  getAdminStats,
  adminGetAllArticles,
  adminGetArticleById,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminGetAllUsers,
  adminUpdateUserRole,
  adminUpdateUserSubscription,
  adminGetNewsletterSubscribers,
  adminGetCategories,
  // Magazine issues helpers
  getPublishedMagazineIssues,
  getMagazineIssueByNumber,
  incrementMagazineDownloadCount,
  adminGetAllMagazineIssues,
  adminGetMagazineIssueById,
  adminCreateMagazineIssue,
  adminUpdateMagazineIssue,
  adminDeleteMagazineIssue,
  // Stats
  getTotalUserCount,
  // Archives
  getArchivedArticles,
  getArticleYears,
  getArchivedMagazineIssues,
  // Profile
  getUserProfile,
  updateUserProfile,
  isProfileCompleted,
  // Opportunities helpers
  getActiveOpportunities,
  getOpportunityBySlug,
  countActiveOpportunities,
  adminGetAllOpportunities,
  adminGetOpportunityById,
  adminCreateOpportunity,
  adminUpdateOpportunity,
  adminDeleteOpportunity,
  adminToggleOpportunityFeatured,
  adminCountOpportunities,
  // Authors helpers
  adminGetAllAuthors,
  adminGetAuthorById,
  adminCreateAuthor,
  adminUpdateAuthor,
  adminDeleteAuthor,
  // Events admin helpers
  adminGetAllEvents,
  adminGetEventById,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
} from "./db";

// Admin-only procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    trialStatus: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return {
          authenticated: false,
          daysRemaining: 0,
          expiresAt: null,
          hasActiveSubscription: false,
          isLaunchPeriod: isLaunchPeriod(),
          trialDurationDays: TRIAL_DURATION_DAYS,
        };
      }
      const activeSub = await getUserSubscription(ctx.user.id);
      const daysRemaining = getTrialDaysRemaining(ctx.user);
      const expiresAt = new Date(
        new Date(ctx.user.createdAt).getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
      );
      return {
        authenticated: true,
        daysRemaining,
        expiresAt: expiresAt.toISOString(),
        hasActiveSubscription: hasActiveSubscription(ctx.user, activeSub ?? null),
        isLaunchPeriod: isLaunchPeriod(),
        trialDurationDays: TRIAL_DURATION_DAYS,
      };
    }),
  }),

  // ═══════════════════════════════════════════════
  // PUBLIC ROUTERS
  // ═══════════════════════════════════════════════

  articles: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => await getPublishedArticles(input.limit, input.offset)),

    free: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => await getFreeArticles(input.limit, input.offset)),

    premium: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => await getPremiumArticles(input.limit, input.offset)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) {
          return { article: null, access: null };
        }
        const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
        const access = canAccessArticle(ctx.user, article, activeSub ?? null);
        const safeArticle = access.allowed ? article : stripPremiumContent(article);
        return { article: safeArticle, access };
      }),

    checkAccess: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) {
          return { allowed: false, reason: "free" as const, trialDaysRemaining: 0, isLaunchPeriod: false };
        }
        const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
        return canAccessArticle(ctx.user, article, activeSub ?? null);
      }),

    downloadUrl: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article introuvable" });
        }
        const activeSub = await getUserSubscription(ctx.user.id);
        const access = canAccessArticle(ctx.user, article, activeSub ?? null);
        if (!access.allowed) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Abonnement requis pour télécharger cet article" });
        }
        return { url: `/api/articles/${encodeURIComponent(article.slug)}/pdf`, slug: article.slug };
      }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => await getArticlesByCategory(input.categoryId, input.limit)),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => await getArticlesByCountry(input.countryId, input.limit)),
  }),

  directory: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => await getEconomicActors(input.limit, input.offset)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => await getEconomicActorBySlug(input.slug)),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(20) }))
      .query(async ({ input }) => await getEconomicActorsByCountry(input.countryId, input.limit)),

    bySector: publicProcedure
      .input(z.object({ sector: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => await getEconomicActorsBySector(input.sector, input.limit)),
  }),

  investments: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => await getOpenInvestmentOpportunities(input.limit, input.offset)),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => await getInvestmentOpportunitiesByCountry(input.countryId, input.limit)),
  }),

  events: router({
    upcoming: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => await getUpcomingEvents(input.limit)),
  }),

  bids: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => await getOpenCallsForBids(input.limit, input.offset)),
  }),

  opportunities: router({
    list: publicProcedure
      .input(z.object({
        type: z.enum(['bid', 'ami', 'job']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => await getActiveOpportunities(input.type, input.limit, input.offset)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => await getOpportunityBySlug(input.slug)),

    counts: publicProcedure
      .query(async () => await countActiveOpportunities()),
  }),

  countries: router({
    list: publicProcedure.query(async () => await getAllCountries()),
    byCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => await getCountryByCode(input.code)),
  }),

  subscriptions: router({
    plans: publicProcedure.query(async () => await getSubscriptionPlans()),
    userPlan: protectedProcedure.query(async ({ ctx }) => await getUserSubscription(ctx.user.id)),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional(), tier: z.enum(["free", "premium"]).default("free") }))
      .mutation(async ({ ctx, input }) => {
        if (input.tier === "premium") {
          if (!ctx.user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Vous devez être connecté et abonné pour la newsletter premium",
            });
          }
          const activeSub = await getUserSubscription(ctx.user.id);
          if (!hasActiveSubscription(ctx.user, activeSub ?? null)) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "La newsletter premium nécessite un abonnement actif (Newsletter Premium ou Habari Intégral)",
            });
          }
        }
        return await subscribeToNewsletter({ email: input.email, name: input.name, tier: input.tier });
      }),

    status: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => await getNewsletterSubscription(input.email)),

    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => await unsubscribeNewsletter(input.email)),
  }),

  // ═══════════════════════════════════════════════
  // USER PROFILE
  // ═══════════════════════════════════════════════

  profile: router({
    /** Get current user profile */
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfile(ctx.user.id);
    }),

    /** Update user profile (registration form) */
    update: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1, "Le prénom est requis"),
        lastName: z.string().min(1, "Le nom est requis"),
        email: z.string().email("Adresse email invalide"),
        phone: z.string().min(6, "Numéro de téléphone invalide"),
        jobFunction: z.string().min(1, "La fonction est requise"),
        organization: z.string().min(1, "L'entreprise/organisation est requise"),
        country: z.string().optional(),
        sector: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateUserProfile(ctx.user.id, input);
      }),

    /** Check if profile is completed */
    isCompleted: protectedProcedure.query(async ({ ctx }) => {
      const completed = await isProfileCompleted(ctx.user.id);
      return { completed };
    }),
  }),

  // ═══════════════════════════════════════════════
  // ADMIN ROUTERS
  // ═══════════════════════════════════════════════

  admin: router({
    /** Dashboard stats */
    stats: adminProcedure.query(async () => await getAdminStats()),

    /** Articles CRUD */
    articles: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          status: z.string().optional(),
        }))
        .query(async ({ input }) => await adminGetAllArticles(input.limit, input.offset, input.status)),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetArticleById(input.id)),

      create: adminProcedure
        .input(z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          excerpt: z.string().optional(),
          content: z.string().min(1),
          authorId: z.number().optional(),
          categoryId: z.number().optional(),
          countryId: z.number().optional(),
          featuredImage: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).default("draft"),
          minSubscriptionTier: z.enum(["free", "standard", "premium", "enterprise"]).default("free"),
        }))
        .mutation(async ({ input }) => await adminCreateArticle(input)),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          authorId: z.number().nullable().optional(),
          categoryId: z.number().nullable().optional(),
          countryId: z.number().nullable().optional(),
          featuredImage: z.string().nullable().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          minSubscriptionTier: z.enum(["free", "standard", "premium", "enterprise"]).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return await adminUpdateArticle(id, data);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteArticle(input.id)),
    }),

    /** Users management */
    users: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => await adminGetAllUsers(input.limit, input.offset, input.search)),

      updateRole: adminProcedure
        .input(z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        }))
        .mutation(async ({ input }) => await adminUpdateUserRole(input.userId, input.role)),

      updateSubscription: adminProcedure
        .input(z.object({
          userId: z.number(),
          tier: z.enum(["free", "standard", "premium", "enterprise"]),
        }))
        .mutation(async ({ input }) => await adminUpdateUserSubscription(input.userId, input.tier)),
    }),

    /** Newsletter subscribers */
    newsletter: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          tier: z.string().optional(),
        }))
        .query(async ({ input }) => await adminGetNewsletterSubscribers(input.limit, input.offset, input.tier)),
    }),

    /** Categories */
    categories: router({
      list: adminProcedure.query(async () => await adminGetCategories()),
    }),

    /** Countries (for dropdowns) */
    countries: router({
      list: adminProcedure.query(async () => await getAllCountries()),
    }),

    /** Magazine issues CRUD */
    magazineIssues: router({
      list: adminProcedure.query(async () => await adminGetAllMagazineIssues()),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetMagazineIssueById(input.id)),

      create: adminProcedure
        .input(z.object({
          issueNumber: z.string().min(1),
          title: z.string().min(1),
          description: z.string().optional(),
          coverUrl: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfFileKey: z.string().optional(),
          coverFileKey: z.string().optional(),
          pageCount: z.number().optional(),
          isPremium: z.boolean().default(true),
          isPublished: z.boolean().default(false),
          sommaire: z.string().optional(),
        }))
        .mutation(async ({ input }) => await adminCreateMagazineIssue(input)),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          issueNumber: z.string().optional(),
          title: z.string().optional(),
          description: z.string().nullable().optional(),
          coverUrl: z.string().nullable().optional(),
          pdfUrl: z.string().nullable().optional(),
          pdfFileKey: z.string().nullable().optional(),
          coverFileKey: z.string().nullable().optional(),
          pageCount: z.number().nullable().optional(),
          isPremium: z.boolean().optional(),
          isPublished: z.boolean().optional(),
          sommaire: z.string().nullable().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return await adminUpdateMagazineIssue(id, data);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteMagazineIssue(input.id)),
    }),

    /** Registered users count */
    userCount: adminProcedure.query(async () => {
      const total = await getTotalUserCount();
      return { totalUsers: total };
    }),

    /** Opportunities CRUD (Appels d'offres, AMI, Emplois) */
    opportunities: router({
      list: adminProcedure
        .input(z.object({
          type: z.enum(['bid', 'ami', 'job']).optional(),
          status: z.enum(['active', 'closed', 'draft']).optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => await adminGetAllOpportunities(input)),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetOpportunityById(input.id)),

      create: adminProcedure
        .input(z.object({
          type: z.enum(['bid', 'ami', 'job']),
          title: z.string().min(1),
          organization: z.string().min(1),
          country: z.string().min(1),
          sector: z.string().optional(),
          description: z.string().optional(),
          budget: z.string().optional(),
          currency: z.string().optional(),
          deadline: z.string().optional(),
          amiType: z.string().optional(),
          partners: z.string().optional(),
          webinaire: z.string().optional(),
          externalLink: z.string().optional(),
          contractType: z.string().optional(),
          experienceLevel: z.string().optional(),
          featured: z.boolean().default(false),
          status: z.enum(['active', 'closed', 'draft']).default('active'),
        }))
        .mutation(async ({ input }) => await adminCreateOpportunity(input)),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          type: z.enum(['bid', 'ami', 'job']).optional(),
          title: z.string().optional(),
          organization: z.string().optional(),
          country: z.string().optional(),
          sector: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          budget: z.string().nullable().optional(),
          currency: z.string().nullable().optional(),
          deadline: z.string().nullable().optional(),
          amiType: z.string().nullable().optional(),
          partners: z.string().nullable().optional(),
          webinaire: z.string().nullable().optional(),
          externalLink: z.string().nullable().optional(),
          contractType: z.string().nullable().optional(),
          experienceLevel: z.string().nullable().optional(),
          featured: z.boolean().optional(),
          status: z.enum(['active', 'closed', 'draft']).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return await adminUpdateOpportunity(id, data);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteOpportunity(input.id)),

      toggleFeatured: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminToggleOpportunityFeatured(input.id)),

      counts: adminProcedure
        .query(async () => await adminCountOpportunities()),
    }),

    /** Contact messages */
    contact: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          status: z.string().optional(),
        }))
        .query(async ({ input }) => await adminGetContactMessages(input.limit, input.offset, input.status)),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetContactMessageById(input.id)),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "archived"]),
        }))
        .mutation(async ({ input }) => await adminUpdateContactMessageStatus(input.id, input.status)),

      countNew: adminProcedure
        .query(async () => await adminCountNewContactMessages()),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteContactMessage(input.id)),
    }),

    /** Authors CRUD */
    authors: router({
      list: adminProcedure.query(async () => await adminGetAllAuthors()),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetAuthorById(input.id)),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          bio: z.string().optional(),
          avatar: z.string().optional(),
          specialization: z.string().optional(),
          userId: z.number().optional(),
        }))
        .mutation(async ({ input }) => await adminCreateAuthor(input)),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().nullable().optional(),
          bio: z.string().nullable().optional(),
          avatar: z.string().nullable().optional(),
          specialization: z.string().nullable().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return await adminUpdateAuthor(id, data);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteAuthor(input.id)),
    }),

    /** Events CRUD */
    events: router({
      list: adminProcedure.query(async () => await adminGetAllEvents()),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => await adminGetEventById(input.id)),

      create: adminProcedure
        .input(z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          type: z.enum(['conference', 'webinar', 'training', 'workshop', 'networking']),
          startDate: z.string(),
          endDate: z.string().optional(),
          location: z.string().optional(),
          countryId: z.number().optional(),
          image: z.string().optional(),
          capacity: z.number().optional(),
          status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
        }))
        .mutation(async ({ input }) => await adminCreateEvent({
          ...input,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        })),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().nullable().optional(),
          type: z.enum(['conference', 'webinar', 'training', 'workshop', 'networking']).optional(),
          startDate: z.string().optional(),
          endDate: z.string().nullable().optional(),
          location: z.string().nullable().optional(),
          countryId: z.number().nullable().optional(),
          image: z.string().nullable().optional(),
          capacity: z.number().nullable().optional(),
          status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, startDate, endDate, ...rest } = input;
          return await adminUpdateEvent(id, {
            ...rest,
            ...(startDate ? { startDate: new Date(startDate) } : {}),
            ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
          });
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => await adminDeleteEvent(input.id)),
    }),

    /** Site settings (prix, config) */
    settings: router({
      list: adminProcedure.query(async () => await getAllSettings()),

      get: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          const value = await getSetting(input.key);
          return { key: input.key, value };
        }),

      set: adminProcedure
        .input(z.object({ key: z.string(), value: z.string() }))
        .mutation(async ({ input }) => {
          await setSetting(input.key, input.value);
          return { success: true };
        }),
    }),

    /** Stripe promo codes (coupons) */
    promoCodes: router({
      list: adminProcedure.query(async () => {
        try {
          const s = getStripe();
          const coupons = await s.coupons.list({ limit: 50 });
          return coupons.data.map(c => ({
            id: c.id,
            name: c.name,
            percentOff: c.percent_off,
            amountOff: c.amount_off,
            currency: c.currency,
            duration: c.duration,
            redeemBy: c.redeem_by,
            timesRedeemed: c.times_redeemed,
            maxRedemptions: c.max_redemptions,
            valid: c.valid,
          }));
        } catch (err: unknown) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
        }
      }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          percentOff: z.number().min(1).max(100).optional(),
          amountOff: z.number().min(1).optional(),
          duration: z.enum(["once", "forever", "repeating"]),
          durationInMonths: z.number().optional(),
          maxRedemptions: z.number().optional(),
          redeemBy: z.string().optional(), // ISO date string
        }).refine(d => d.percentOff || d.amountOff, { message: "percentOff ou amountOff est requis" }))
        .mutation(async ({ input }) => {
          try {
            const s = getStripe();
            const coupon = await s.coupons.create({
              name: input.name,
              ...(input.percentOff ? { percent_off: input.percentOff } : {}),
              ...(input.amountOff ? { amount_off: input.amountOff, currency: "eur" } : {}),
              duration: input.duration,
              ...(input.duration === "repeating" && input.durationInMonths ? { duration_in_months: input.durationInMonths } : {}),
              ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
              ...(input.redeemBy ? { redeem_by: Math.floor(new Date(input.redeemBy).getTime() / 1000) } : {}),
            });
            return { id: coupon.id, name: coupon.name, valid: coupon.valid };
          } catch (err: unknown) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
          }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          try {
            const s = getStripe();
            await s.coupons.del(input.id);
            return { success: true };
          } catch (err: unknown) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
          }
        }),
    }),
  }),

  // ═══════════════════════════════════════════════
  // STRIPE PAYMENTS
  // ═══════════════════════════════════════════════

  stripe: router({
    /** Get available products and prices */
    products: publicProcedure.query(() => {
      return Object.entries(HABARI_PRODUCTS).map(([key, product]) => ({
        key,
        name: product.name,
        description: product.description,
        prices: {
          monthly: { amount: product.prices.monthly.amount, label: product.prices.monthly.label },
          annual: { amount: product.prices.annual.amount, label: product.prices.annual.label },
        },
      }));
    }),

    /** Create a checkout session */
    createCheckout: protectedProcedure
      .input(z.object({
        productKey: z.enum(["premiumAccess", "newsletterPremium", "bundle"]),
        interval: z.enum(["monthly", "annual"]),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await createCheckoutSession({
            productKey: input.productKey as ProductKey,
            interval: input.interval as PriceInterval,
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            userName: ctx.user.name || undefined,
            origin: input.origin,
          });
        } catch (err: unknown) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
        }
      }),

    /** Get checkout session result */
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        try {
          const session = await getCheckoutSession(input.sessionId);
          if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session introuvable" });
          return {
            status: session.status,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_email,
          };
        } catch (err: unknown) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
        }
      }),

    /** Cancel subscription */
    cancelSubscription: protectedProcedure
      .input(z.object({ subscriptionId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await cancelSubscription(input.subscriptionId);
          return { success: true };
        } catch (err: unknown) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Stripe error" });
        }
      }),
  }),

  // ═══════════════════════════════════════════════
  // MAGAZINE PDF ACCESS
  // ═══════════════════════════════════════════════

  magazineIssues: router({
    /** List published issues (public) */
    list: publicProcedure.query(async () => await getPublishedMagazineIssues()),

    /** Get issue by number (public) */
    byNumber: publicProcedure
      .input(z.object({ issueNumber: z.string() }))
      .query(async ({ input }) => await getMagazineIssueByNumber(input.issueNumber)),

    /** Track download */
    trackDownload: publicProcedure
      .input(z.object({ issueId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementMagazineDownloadCount(input.issueId);
        return { success: true };
      }),
  }),

  magazine: router({
    /** Check if user has access to a specific magazine issue */
    checkAccess: publicProcedure
      .input(z.object({ issueId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Launch period: free premium access for all registered users until June 1, 2026
        const LAUNCH_END_DATE = new Date("2026-06-01T00:00:00Z");
        const isLaunchPeriod = new Date() < LAUNCH_END_DATE;

        // Define which issues require premium
        const PREMIUM_ISSUES = ["N001", "N002", "N003"]; // Future issues are premium
        const FREE_ISSUES = ["N000"]; // First issue is free

        const isPremiumIssue = PREMIUM_ISSUES.includes(input.issueId);
        const isFreeIssue = FREE_ISSUES.includes(input.issueId);

        // Free issues require a registered account to download
        if (isFreeIssue || !isPremiumIssue) {
          if (!ctx.user) {
            return { hasAccess: false, reason: "not_authenticated" as const, isLaunchPeriod };
          }
          return { hasAccess: true, reason: "free" as const, isLaunchPeriod };
        }

        // Not logged in
        if (!ctx.user) {
          return { hasAccess: false, reason: "not_authenticated" as const, isLaunchPeriod };
        }

        // Admin always has access
        if (ctx.user.role === "admin") {
          return { hasAccess: true, reason: "admin" as const, isLaunchPeriod };
        }

        // During launch period, all registered users get premium access
        if (isLaunchPeriod) {
          return { hasAccess: true, reason: "launch_promo" as const, isLaunchPeriod };
        }

        // After launch period: check user subscription tier
        const tier = ctx.user.subscriptionTier;
        if (tier === "premium" || tier === "enterprise") {
          return { hasAccess: true, reason: "subscription" as const, isLaunchPeriod };
        }

        // Also check active subscription in userSubscriptions table
        const activeSub = await getUserSubscription(ctx.user.id);
        if (activeSub && (activeSub.tier === "premium" || activeSub.tier === "enterprise") && activeSub.status === "active") {
          return { hasAccess: true, reason: "subscription" as const, isLaunchPeriod };
        }

        // Check if user bought this specific issue
        const issueRecord = await getMagazineIssueByNumber(input.issueId);
        if (issueRecord) {
          const purchased = await hasUserPurchasedMagazine(ctx.user.id, issueRecord.id);
          if (purchased) {
            return { hasAccess: true, reason: "purchased" as const, isLaunchPeriod };
          }
        }

        return { hasAccess: false, reason: "no_subscription" as const, isLaunchPeriod };
      }),

    /** Get launch period status */
    launchStatus: publicProcedure.query(() => {
      const LAUNCH_END_DATE = new Date("2026-06-01T00:00:00Z");
      const now = new Date();
      const isLaunchPeriod = now < LAUNCH_END_DATE;
      const daysRemaining = isLaunchPeriod ? Math.ceil((LAUNCH_END_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return { isLaunchPeriod, launchEndDate: LAUNCH_END_DATE.toISOString(), daysRemaining };
    }),

    /** Buy a single magazine issue (one-time payment) */
    purchaseIssue: protectedProcedure
      .input(z.object({
        issueNumber: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const issue = await getMagazineIssueByNumber(input.issueNumber);
          if (!issue) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Numéro introuvable" });
          }
          const alreadyPurchased = await hasUserPurchasedMagazine(ctx.user.id, issue.id);
          if (alreadyPurchased) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Vous avez déjà acheté ce numéro" });
          }
          return await createMagazinePdfCheckoutSession({
            issueId: issue.id,
            issueNumber: issue.issueNumber,
            issueTitle: issue.title,
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            origin: input.origin,
          });
        } catch (err: unknown) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Erreur lors de l'achat" });
        }
      }),

    /** Check if user has purchased a specific issue */
    hasPurchased: protectedProcedure
      .input(z.object({ issueNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const issue = await getMagazineIssueByNumber(input.issueNumber);
        if (!issue) return { purchased: false };
        const purchased = await hasUserPurchasedMagazine(ctx.user.id, issue.id);
        return { purchased };
      }),

    /** List user's purchased magazine issues */
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      return await listUserMagazinePurchases(ctx.user.id);
    }),

    /** Get magazine PDF unit price (dynamic, admin-configurable) */
    pdfPrice: publicProcedure.query(async () => {
      const raw = await getSetting("magazine_pdf_price");
      const amount = raw ? parseInt(raw, 10) : MAGAZINE_PDF_PRICE.amount;
      return {
        amount,
        currency: MAGAZINE_PDF_PRICE.currency,
        formatted: `${(amount / 100).toFixed(2).replace(".", ",")} €`,
      };
    }),
  }),

  // ═══════════════════════════════════════════════
  // PUBLIC SITE SETTINGS
  // ═══════════════════════════════════════════════

  siteConfig: router({
    promo: publicProcedure.query(async () => {
      const [code, message] = await Promise.all([
        getSetting("promo_code_active"),
        getSetting("promo_message"),
      ]);
      return {
        code: code || null,
        message: message || null,
        active: !!(code && code.trim()),
      };
    }),
  }),

  // ═══════════════════════════════════════════════
  // PUBLIC ARCHIVES
  // ═══════════════════════════════════════════════

  archives: router({
    /** List archived articles with filters */
    articles: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        year: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(12),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => await getArchivedArticles(input)),

    /** Get available years for filtering */
    years: publicProcedure.query(async () => await getArticleYears()),

    /** Get available categories for filtering */
    categories: publicProcedure.query(async () => await adminGetCategories()),

    /** List archived magazine issues with filters */
    issues: publicProcedure
      .input(z.object({
        year: z.number().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => await getArchivedMagazineIssues(input)),
  }),

  // ═══════════════════════════════════════════════
  // PUBLIC CONTACT
  // ═══════════════════════════════════════════════

  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z.string().email("Adresse email invalide"),
        subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
        message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
        category: z.enum(["general", "editorial", "partnership", "advertising", "subscription", "other"]).default("general"),
      }))
      .mutation(async ({ input }) => await submitContactMessage(input)),
  }),
});

export type AppRouter = typeof appRouter;
