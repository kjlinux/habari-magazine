import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  canAccess,
  canAccessArticle,
  getTrialDaysRemaining,
  hasActiveSubscription,
  hasIntegral,
  hasNewsletterPremium,
  isLaunchPeriod,
  getLaunchEndDate,
  stripPremiumContent,
  TRIAL_DURATION_DAYS,
  type SubscriptionTier,
} from "./_core/access";
import { createCheckoutSession, getCheckoutSession, cancelSubscription, createMagazinePdfCheckoutSession, getStripe } from "./stripe/stripe";
import { notifyNewArticle, notifyNewOpportunity, notifyNewEvent, sendNewsletterBroadcast, countTargets, type NotifPreference } from "./_core/notificationService";
import { getVapidPublicKey, sendBulkPush } from "./_core/webpush";
import { getDb } from "./db";
import { pushSubscriptions, userFavorites, articles as articlesTable } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
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
  confirmNewsletterByToken,
  unsubscribeByToken,
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
  getNextMagazineIssueNumber,
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
  getUserNotificationPrefs,
  updateUserNotificationPrefs,
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
  // Directory admin helpers
  adminGetAllActors,
  adminGetActorById,
  adminCreateActor,
  adminUpdateActor,
  adminDeleteActor,
  adminToggleActorVerified,
  adminCountActors,
  // Investments admin helpers
  adminGetAllInvestments,
  adminGetInvestmentById,
  adminCreateInvestment,
  adminUpdateInvestment,
  adminDeleteInvestment,
  adminCountInvestments,
  // Partners
  getPublishedPartners,
  getPartnerBySlug,
  adminGetAllPartners,
  adminGetPartnerById,
  adminCreatePartner,
  adminUpdatePartner,
  adminDeletePartner,
  adminTogglePartnerFeatured,
  // Economic indicators
  getEconomicIndicators,
  getInvestmentStats,
  adminGetAllEconomicIndicators,
  adminCreateEconomicIndicator,
  adminUpdateEconomicIndicator,
  adminDeleteEconomicIndicator,
  updateSubscriptionPlan,
  getCommunityMembers,
  adminGetAllCommunityMembers,
  adminGetCommunityMemberById,
  adminCreateCommunityMember,
  adminUpdateCommunityMember,
  adminDeleteCommunityMember,
  adminToggleCommunityMemberVerified,
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
      .query(async ({ ctx, input }) => {
        try {
          const rawArticles = await getPublishedArticles(input.limit, input.offset);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          return rawArticles.map((article) => {
            const access = canAccessArticle(ctx.user, article, activeSub ?? null);
            return { ...(!access.allowed ? stripPremiumContent(article) : article), access };
          });
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
      }),

    free: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        try { return await getFreeArticles(input.limit, input.offset); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
      }),

    premium: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        try { return await getPremiumArticles(input.limit, input.offset); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const article = await getArticleBySlug(input.slug);
          if (!article) return { article: null, access: null };
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const access = canAccessArticle(ctx.user, article, activeSub ?? null);
          const safeArticle = access.allowed ? article : stripPremiumContent(article);
          return { article: safeArticle, access };
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'article" });
        }
      }),

    checkAccess: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const article = await getArticleBySlug(input.slug);
          if (!article) return { allowed: false, reason: "free" as const, trialDaysRemaining: 0, isLaunchPeriod: false };
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          return canAccessArticle(ctx.user, article, activeSub ?? null);
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification d'accès" });
        }
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
      .query(async ({ ctx, input }) => {
        try {
          const rawArticles = await getArticlesByCategory(input.categoryId, input.limit);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          return rawArticles.map((article) => {
            const access = canAccessArticle(ctx.user, article, activeSub ?? null);
            return { ...(!access.allowed ? stripPremiumContent(article) : article), access };
          });
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
      }),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        try {
          const rawArticles = await getArticlesByCountry(input.countryId, input.limit);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          return rawArticles.map((article) => {
            const access = canAccessArticle(ctx.user, article, activeSub ?? null);
            return { ...(!access.allowed ? stripPremiumContent(article) : article), access };
          });
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
      }),
  }),

  directory: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        try { return await getEconomicActors(input.limit, input.offset); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'annuaire" }); }
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        try { return await getEconomicActorBySlug(input.slug); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'acteur" }); }
      }),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        try { return await getEconomicActorsByCountry(input.countryId, input.limit); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'annuaire" }); }
      }),

    bySector: publicProcedure
      .input(z.object({ sector: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        try { return await getEconomicActorsBySector(input.sector, input.limit); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'annuaire" }); }
      }),
  }),

  investments: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => {
        try {
          const opportunities = await getOpenInvestmentOpportunities(input.limit, input.offset);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const items = opportunities.map((opp: any) => {
            const minTier: SubscriptionTier = (opp.minSubscriptionTier as SubscriptionTier) ?? "premium";
            const access = canAccess(ctx.user, minTier, activeSub ?? null);
            if (access.allowed) return { ...opp, access };
            const { description, targetAmount, minInvestment, expectedReturn, timeline, ...teaser } = opp;
            return { ...teaser, description: null, targetAmount: null, minInvestment: null, expectedReturn: null, timeline: null, access };
          });
          return items;
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des investissements" }); }
      }),

    byCountry: publicProcedure
      .input(z.object({ countryId: z.number(), limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        try {
          const opportunities = await getInvestmentOpportunitiesByCountry(input.countryId, input.limit);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const items = opportunities.map((opp: any) => {
            const minTier: SubscriptionTier = (opp.minSubscriptionTier as SubscriptionTier) ?? "premium";
            const access = canAccess(ctx.user, minTier, activeSub ?? null);
            if (access.allowed) return { ...opp, access };
            const { description, targetAmount, minInvestment, expectedReturn, timeline, ...teaser } = opp;
            return { ...teaser, description: null, targetAmount: null, minInvestment: null, expectedReturn: null, timeline: null, access };
          });
          return items;
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des investissements" }); }
      }),

    stats: publicProcedure.query(async () => {
      try { return await getInvestmentStats(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du calcul des statistiques" }); }
    }),

    indicators: publicProcedure.query(async () => {
      try { return await getEconomicIndicators(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des indicateurs" }); }
    }),
  }),

  events: router({
    upcoming: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        try {
          const includeExclusive = hasIntegral(ctx.user ?? null);
          return await getUpcomingEvents(input.limit, includeExclusive);
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des événements" }); }
      }),
  }),

  partners: router({
    list: publicProcedure
      .input(z.object({
        category: z.enum(['communique', 'sponsored', 'report']).optional(),
        limit: z.number().default(30),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try { return await getPublishedPartners(input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des partenaires" }); }
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        try { return await getPartnerBySlug(input.slug); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du partenaire" }); }
      }),
  }),

  bids: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        try { return await getOpenCallsForBids(input.limit, input.offset); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des appels d'offres" }); }
      }),
  }),

  opportunities: router({
    list: publicProcedure
      .input(z.object({
        type: z.enum(['bid', 'ami', 'job']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const items = await getActiveOpportunities(input.type, input.limit, input.offset);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          return items.map((opp: any) => {
            const access = canAccess(ctx.user, "premium", activeSub ?? null);
            if (access.allowed) return { ...opp, access };
            const { description, externalLink, budget, webinaire, partners, ...teaser } = opp;
            return { ...teaser, description: null, externalLink: null, budget: null, webinaire: null, partners: null, access };
          });
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des opportunités" }); }
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const opp = await getOpportunityBySlug(input.slug);
          if (!opp) return null;
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const access = canAccess(ctx.user, "premium", activeSub ?? null);
          if (access.allowed) return { ...opp, access };
          const { description, externalLink, budget, webinaire, partners, ...teaser } = opp;
          return { ...teaser, description: null, externalLink: null, budget: null, webinaire: null, partners: null, access };
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'opportunité" }); }
      }),

    counts: publicProcedure
      .query(async () => {
        try { return await countActiveOpportunities(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage des opportunités" }); }
      }),
  }),

  community: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        try { return await getCommunityMembers(input.limit, input.offset); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de la communauté" }); }
      }),

    join: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Le nom est requis"),
        role: z.string().optional(),
        company: z.string().optional(),
        country: z.string().optional(),
        category: z.string().optional(),
        bio: z.string().max(500).optional(),
        linkedin: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
        email: z.string().email("Email invalide").optional().or(z.literal("")),
      }))
      .mutation(async ({ input }) => {
        try {
          return await adminCreateCommunityMember({
            ...input,
            linkedin: input.linkedin || null,
            email: input.email || null,
            verified: false,
            featured: false,
            published: false,
          });
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'envoi de la demande" });
        }
      }),
  }),

  countries: router({
    list: publicProcedure.query(async () => {
      try { return await getAllCountries(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des pays" }); }
    }),
    byCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        try { return await getCountryByCode(input.code); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du pays" }); }
      }),
  }),

  subscriptions: router({
    plans: publicProcedure.query(async () => {
      try { return await getSubscriptionPlans(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des plans" }); }
    }),
    userPlan: protectedProcedure.query(async ({ ctx }) => {
      try { return await getUserSubscription(ctx.user.id); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'abonnement" }); }
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional(), tier: z.enum(["free", "premium"]).default("free") }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (input.tier === "premium") {
            if (!ctx.user) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Vous devez être connecté et abonné pour la newsletter premium",
              });
            }
            if (!hasNewsletterPremium(ctx.user)) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "La newsletter premium nécessite un abonnement actif (Newsletter Premium ou Habari Intégral)",
              });
            }
          }
          const result = await subscribeToNewsletter({ email: input.email, name: input.name, tier: input.tier });
          if (result?.confirmToken) {
            const { sendEmail } = await import("./_core/email");
            const { ENV } = await import("./_core/env");
            const base = ENV.appUrl || "https://habarimag.online";
            const confirmUrl = `${base}/newsletter/confirmer?token=${result.confirmToken}`;
            const unsubUrl = `${base}/newsletter/desinscription?token=${result.unsubscribeToken}`;
            const subject = "Confirmez votre inscription à la newsletter Habari";
            const text = `Bonjour,\n\nMerci de vous être inscrit à la newsletter Habari Magazine.\nPour confirmer votre inscription, cliquez sur le lien ci-dessous :\n\n${confirmUrl}\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez ce message ou désinscrivez-vous ici :\n${unsubUrl}\n\nCordialement,\nL'équipe Habari Magazine`;
            const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;max-width:560px;"><tr><td><h1 style="margin:0 0 16px;font-size:22px;color:#111;">Confirmez votre inscription</h1><p style="margin:0 0 12px;line-height:1.5;">Bonjour,</p><p style="margin:0 0 12px;line-height:1.5;">Merci de vous être inscrit à la newsletter Habari Magazine. Pour activer votre abonnement, cliquez sur le bouton ci-dessous :</p><p style="margin:24px 0;text-align:center;"><a href="${confirmUrl}" style="display:inline-block;background:#c8102e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;">Confirmer mon inscription</a></p><p style="margin:0 0 12px;line-height:1.5;font-size:13px;color:#555;">Lien direct : <a href="${confirmUrl}" style="color:#c8102e;word-break:break-all;">${confirmUrl}</a></p><p style="margin:24px 0 0;line-height:1.5;font-size:12px;color:#777;">Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message ou <a href="${unsubUrl}" style="color:#777;">désinscrivez-vous</a>.</p></td></tr></table></td></tr></table></body></html>`;
            sendEmail({ to: input.email, subject, html, text }).catch((err) =>
              console.warn("[Newsletter] Confirm email failed:", err),
            );
          }
          return { success: true };
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'inscription à la newsletter" });
        }
      }),

    confirm: publicProcedure
      .input(z.object({ token: z.string().min(8) }))
      .mutation(async ({ input }) => {
        try {
          const r = await confirmNewsletterByToken(input.token);
          if (!r.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Lien invalide ou expiré" });
          return { ok: true };
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la confirmation" });
        }
      }),

    unsubscribeByToken: publicProcedure
      .input(z.object({ token: z.string().min(8) }))
      .mutation(async ({ input }) => {
        try {
          const r = await unsubscribeByToken(input.token);
          if (!r.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Lien invalide" });
          return { ok: true };
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la désinscription" });
        }
      }),

    status: protectedProcedure
      .query(async ({ ctx }) => {
        try { return await getNewsletterSubscription(ctx.user.email); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification" }); }
      }),

    unsubscribe: protectedProcedure
      .mutation(async ({ ctx }) => {
        try { return await unsubscribeNewsletter(ctx.user.email); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la désinscription" }); }
      }),
  }),

  // ═══════════════════════════════════════════════
  // USER PROFILE
  // ═══════════════════════════════════════════════

  profile: router({
    /** Get current user profile */
    get: protectedProcedure.query(async ({ ctx }) => {
      try { return await getUserProfile(ctx.user.id); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du profil" }); }
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
        try { return await updateUserProfile(ctx.user.id, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du profil" }); }
      }),

    /** Check if profile is completed */
    isCompleted: protectedProcedure.query(async ({ ctx }) => {
      try {
        const completed = await isProfileCompleted(ctx.user.id);
        return { completed };
      } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification du profil" }); }
    }),

    /** Update notification preferences */
    updateNotifications: protectedProcedure
      .input(z.object({
        notifNewsletter: z.boolean(),
        notifNewArticles: z.boolean(),
        notifInvestments: z.boolean(),
        notifTenders: z.boolean(),
        notifEvents: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        try { return await updateUserNotificationPrefs(ctx.user.id, input); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour des notifications" }); }
      }),

    /** Get VAPID public key for push subscription */
    getVapidKey: protectedProcedure.query(() => {
      return { publicKey: getVapidPublicKey() };
    }),

    /** Save browser push subscription */
    savePushSubscription: protectedProcedure
      .input(z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("DB unavailable");
          // Upsert: delete existing for same endpoint then insert
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, input.endpoint));
          await db.insert(pushSubscriptions).values({ userId: ctx.user.id, ...input });
          return { success: true };
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'enregistrement de l'abonnement push" }); }
      }),

    /** Remove browser push subscription */
    removePushSubscription: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: true };
          await db.delete(pushSubscriptions).where(
            and(eq(pushSubscriptions.endpoint, input.endpoint), eq(pushSubscriptions.userId, ctx.user.id))
          );
          return { success: true };
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'abonnement push" }); }
      }),

    /** Save / unsave an article */
    saveArticle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("DB unavailable");
          const existing = await db.select().from(userFavorites)
            .where(and(eq(userFavorites.userId, ctx.user.id), eq(userFavorites.articleId, input.articleId)))
            .limit(1);
          if (existing.length > 0) {
            await db.delete(userFavorites).where(eq(userFavorites.id, existing[0].id));
            return { saved: false };
          }
          await db.insert(userFavorites).values({ userId: ctx.user.id, articleId: input.articleId });
          return { saved: true };
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la sauvegarde" }); }
      }),

    /** Check if article is saved */
    isArticleSaved: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { saved: false };
          const existing = await db.select().from(userFavorites)
            .where(and(eq(userFavorites.userId, ctx.user.id), eq(userFavorites.articleId, input.articleId)))
            .limit(1);
          return { saved: existing.length > 0 };
        } catch { return { saved: false }; }
      }),

    /** Get all saved articles for current user */
    savedArticles: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select({
          id: articlesTable.id,
          title: articlesTable.title,
          slug: articlesTable.slug,
          excerpt: articlesTable.excerpt,
          featuredImage: articlesTable.featuredImage,
          publishedAt: articlesTable.publishedAt,
          savedAt: userFavorites.createdAt,
        })
          .from(userFavorites)
          .innerJoin(articlesTable, eq(userFavorites.articleId, articlesTable.id))
          .where(eq(userFavorites.userId, ctx.user.id))
          .orderBy(userFavorites.createdAt);
        return rows;
      } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles sauvegardés" }); }
    }),
  }),

  // ═══════════════════════════════════════════════
  // ADMIN ROUTERS
  // ═══════════════════════════════════════════════

  admin: router({
    /** Dashboard stats */
    stats: adminProcedure.query(async () => {
      try { return await getAdminStats(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des statistiques" }); }
    }),

    /** Articles CRUD */
    articles: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          status: z.string().optional(),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllArticles(input.limit, input.offset, input.status); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des articles" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetArticleById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'article" }); }
        }),

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
          minSubscriptionTier: z.enum(["free", "premium", "integral"]).default("free"),
        }))
        .mutation(async ({ input }) => {
          try {
            const article = await adminCreateArticle(input);
            if (input.status === "published" && article) {
              notifyNewArticle({ id: (article as any).id ?? 0, title: input.title, excerpt: input.excerpt, slug: input.slug }).catch(() => {});
            }
            return article;
          } catch (e) {
            if (e instanceof TRPCError) throw e;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création de l'article" });
          }
        }),

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
          minSubscriptionTier: z.enum(["free", "premium", "integral"]).optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            const article = await adminUpdateArticle(id, data);
            if (input.status === "published" && article) {
              const a = article as any;
              notifyNewArticle({ id, title: a.title ?? "", excerpt: a.excerpt, slug: a.slug ?? "" }).catch(() => {});
            }
            return article;
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de l'article" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteArticle(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'article" }); }
        }),
    }),

    /** Users management */
    users: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllUsers(input.limit, input.offset, input.search); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des utilisateurs" }); }
        }),

      updateRole: adminProcedure
        .input(z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        }))
        .mutation(async ({ input }) => {
          try { return await adminUpdateUserRole(input.userId, input.role); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du rôle" }); }
        }),

      updateSubscription: adminProcedure
        .input(z.object({
          userId: z.number(),
          tier: z.enum(["free", "premium", "integral"]),
        }))
        .mutation(async ({ input }) => {
          try { return await adminUpdateUserSubscription(input.userId, input.tier); }
          catch (err) {
            console.error("[updateSubscription]", err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'abonnement" });
          }
        }),
    }),

    /** Newsletter subscribers */
    newsletter: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          tier: z.string().optional(),
        }))
        .query(async ({ input }) => {
          try { return await adminGetNewsletterSubscribers(input.limit, input.offset, input.tier); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des abonnés" }); }
        }),
    }),

    /** Categories */
    categories: router({
      list: adminProcedure.query(async () => {
        try { return await adminGetCategories(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des rubriques" }); }
      }),
    }),

    /** Countries (for dropdowns) */
    countries: router({
      list: adminProcedure.query(async () => {
        try { return await getAllCountries(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des pays" }); }
      }),
    }),

    /** Magazine issues CRUD */
    magazineIssues: router({
      list: adminProcedure.query(async () => {
        try { return await adminGetAllMagazineIssues(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des numéros" }); }
      }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetMagazineIssueById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du numéro" }); }
        }),

      create: adminProcedure
        .input(z.object({
          issueNumber: z.string().optional(),
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
        .mutation(async ({ input }) => {
          try {
            const issueNumber = input.issueNumber || await getNextMagazineIssueNumber();
            return await adminCreateMagazineIssue({ ...input, issueNumber });
          } catch (e) {
            if (e instanceof TRPCError) throw e;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création du numéro" });
          }
        }),

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
          try {
            const { id, ...data } = input;
            return await adminUpdateMagazineIssue(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du numéro" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteMagazineIssue(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression du numéro" }); }
        }),
    }),

    /** Registered users count */
    userCount: adminProcedure.query(async () => {
      try {
        const total = await getTotalUserCount();
        return { totalUsers: total };
      } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage des utilisateurs" }); }
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
        .query(async ({ input }) => {
          try { return await adminGetAllOpportunities(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des opportunités" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetOpportunityById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'opportunité" }); }
        }),

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
        .mutation(async ({ input }) => {
          try {
            const opp = await adminCreateOpportunity(input);
            if (input.status === "active" && opp) {
              const o = opp as any;
              notifyNewOpportunity({ id: o.id ?? 0, title: input.title, type: input.type, slug: o.slug }).catch(() => {});
            }
            return opp;
          } catch (e) {
            if (e instanceof TRPCError) throw e;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création de l'opportunité" });
          }
        }),

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
          try {
            const { id, ...data } = input;
            return await adminUpdateOpportunity(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de l'opportunité" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteOpportunity(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'opportunité" }); }
        }),

      toggleFeatured: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminToggleOpportunityFeatured(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise en vedette" }); }
        }),

      counts: adminProcedure
        .query(async () => {
          try { return await adminCountOpportunities(); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage des opportunités" }); }
        }),
    }),

    /** Directory CRUD (economicActors) */
    directory: router({
      list: adminProcedure
        .input(z.object({
          sector: z.string().optional(),
          countryId: z.number().optional(),
          verified: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllActors(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'annuaire" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetActorById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'acteur" }); }
        }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          sector: z.string().optional(),
          subsector: z.string().optional(),
          countryId: z.number().optional(),
          website: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          logo: z.string().optional(),
          foundedYear: z.number().optional(),
          employees: z.string().optional(),
          verified: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
          try { return await adminCreateActor(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création de l'acteur" }); }
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().nullable().optional(),
          sector: z.string().nullable().optional(),
          subsector: z.string().nullable().optional(),
          countryId: z.number().nullable().optional(),
          website: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
          phone: z.string().nullable().optional(),
          logo: z.string().nullable().optional(),
          foundedYear: z.number().nullable().optional(),
          employees: z.string().nullable().optional(),
          verified: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            return await adminUpdateActor(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de l'acteur" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteActor(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'acteur" }); }
        }),

      toggleVerified: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminToggleActorVerified(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification" }); }
        }),

      counts: adminProcedure
        .query(async () => {
          try { return await adminCountActors(); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage" }); }
        }),
    }),

    /** Investments CRUD (investmentOpportunities) */
    investments: router({
      list: adminProcedure
        .input(z.object({
          investmentType: z.enum(['equity', 'debt', 'grant', 'partnership']).optional(),
          status: z.enum(['open', 'closed', 'funded']).optional(),
          countryId: z.number().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllInvestments(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des investissements" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetInvestmentById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'investissement" }); }
        }),

      create: adminProcedure
        .input(z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          actorId: z.number().optional(),
          countryId: z.number().optional(),
          sector: z.string().optional(),
          investmentType: z.enum(['equity', 'debt', 'grant', 'partnership']),
          targetAmount: z.string().optional(),
          currency: z.string().optional(),
          minInvestment: z.string().optional(),
          expectedReturn: z.string().optional(),
          timeline: z.string().optional(),
          status: z.enum(['open', 'closed', 'funded']).default('open'),
          image: z.string().optional(),
          minSubscriptionTier: z.enum(['free', 'premium', 'integral']).default('premium'),
        }))
        .mutation(async ({ input }) => {
          try {
            const result = await adminCreateInvestment(input);
            if (!result) throw new Error("Database connection failed");
            return result;
          } catch (e) {
            console.error("[admin.investments.create]", e);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création" });
          }
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          actorId: z.number().nullable().optional(),
          countryId: z.number().nullable().optional(),
          sector: z.string().nullable().optional(),
          investmentType: z.enum(['equity', 'debt', 'grant', 'partnership']).optional(),
          targetAmount: z.string().nullable().optional(),
          currency: z.string().nullable().optional(),
          minInvestment: z.string().nullable().optional(),
          expectedReturn: z.string().nullable().optional(),
          timeline: z.string().nullable().optional(),
          status: z.enum(['open', 'closed', 'funded']).optional(),
          image: z.string().nullable().optional(),
          minSubscriptionTier: z.enum(['free', 'premium', 'integral']).optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            return await adminUpdateInvestment(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteInvestment(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression" }); }
        }),

      counts: adminProcedure
        .query(async () => {
          try { return await adminCountInvestments(); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage" }); }
        }),
    }),

    /** Economic Indicators CRUD */
    economicIndicators: router({
      list: adminProcedure.query(async () => {
        try { return await adminGetAllEconomicIndicators(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des indicateurs" }); }
      }),

      create: adminProcedure
        .input(z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          trend: z.enum(["up", "down", "stable"]).default("stable"),
          delta: z.string().optional(),
          category: z.enum(["macro", "commodity"]).default("macro"),
          periodLabel: z.string().optional(),
          sortOrder: z.number().default(0),
        }))
        .mutation(async ({ input }) => {
          try { return await adminCreateEconomicIndicator(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création" }); }
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          label: z.string().optional(),
          value: z.string().optional(),
          trend: z.enum(["up", "down", "stable"]).optional(),
          delta: z.string().nullable().optional(),
          category: z.enum(["macro", "commodity"]).optional(),
          periodLabel: z.string().nullable().optional(),
          sortOrder: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            return await adminUpdateEconomicIndicator(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteEconomicIndicator(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression" }); }
        }),
    }),

    /** Partners CRUD */
    partners: router({
      list: adminProcedure
        .input(z.object({
          category: z.enum(['communique', 'sponsored', 'report']).optional(),
          published: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllPartners(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des partenaires" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetPartnerById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du partenaire" }); }
        }),

      create: adminProcedure
        .input(z.object({
          title: z.string().min(1),
          category: z.enum(['communique', 'sponsored', 'report']),
          source: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          tag: z.string().optional(),
          image: z.string().optional(),
          externalLink: z.string().optional(),
          featured: z.boolean().default(false),
          published: z.boolean().default(true),
          publishedAt: z.coerce.date().optional(),
        }))
        .mutation(async ({ input }) => {
          try { return await adminCreatePartner(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création" }); }
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          category: z.enum(['communique', 'sponsored', 'report']).optional(),
          source: z.string().nullable().optional(),
          excerpt: z.string().nullable().optional(),
          content: z.string().nullable().optional(),
          tag: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
          externalLink: z.string().nullable().optional(),
          featured: z.boolean().optional(),
          published: z.boolean().optional(),
          publishedAt: z.coerce.date().nullable().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            return await adminUpdatePartner(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeletePartner(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression" }); }
        }),

      toggleFeatured: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminTogglePartnerFeatured(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise en vedette" }); }
        }),
    }),

    /** Contact messages */
    contact: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          status: z.string().optional(),
        }))
        .query(async ({ input }) => {
          try { return await adminGetContactMessages(input.limit, input.offset, input.status); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des messages" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetContactMessageById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du message" }); }
        }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "archived"]),
        }))
        .mutation(async ({ input }) => {
          try { return await adminUpdateContactMessageStatus(input.id, input.status); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du statut" }); }
        }),

      countNew: adminProcedure
        .query(async () => {
          try { return await adminCountNewContactMessages(); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage des messages" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteContactMessage(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression du message" }); }
        }),
    }),

    /** Authors CRUD */
    authors: router({
      list: adminProcedure.query(async () => {
        try { return await adminGetAllAuthors(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des auteurs" }); }
      }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetAuthorById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'auteur" }); }
        }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          bio: z.string().optional(),
          avatar: z.string().optional(),
          specialization: z.string().optional(),
          userId: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          try { return await adminCreateAuthor(input); }
          catch (e) {
            if (e instanceof TRPCError) throw e;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création de l'auteur" });
          }
        }),

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
          try {
            const { id, ...data } = input;
            return await adminUpdateAuthor(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de l'auteur" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteAuthor(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'auteur" }); }
        }),
    }),

    /** Events CRUD */
    events: router({
      list: adminProcedure.query(async () => {
        try { return await adminGetAllEvents(); }
        catch (e) { console.error("[events.list error]", e); throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e instanceof Error ? e.message : "Erreur lors du chargement des événements" }); }
      }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetEventById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement de l'événement" }); }
        }),

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
          isExclusive: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
          try {
            const event = await adminCreateEvent({
              ...input,
              startDate: new Date(input.startDate),
              endDate: input.endDate ? new Date(input.endDate) : undefined,
            });
            if (event) {
              const e = event as any;
              notifyNewEvent({ id: e.id ?? 0, title: input.title, slug: e.slug, startDate: input.startDate }).catch(() => {});
            }
            return event;
          } catch (e) {
            if (e instanceof TRPCError) throw e;
            console.error("[events.create error]", e);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e instanceof Error ? e.message : "Erreur lors de la création de l'événement" });
          }
        }),

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
          isExclusive: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, startDate, endDate, ...rest } = input;
            return await adminUpdateEvent(id, {
              ...rest,
              ...(startDate ? { startDate: new Date(startDate) } : {}),
              ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
            });
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de l'événement" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteEvent(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de l'événement" }); }
        }),
    }),

    /** Site settings (prix, config) */
    settings: router({
      list: adminProcedure.query(async () => {
        try { return await getAllSettings(); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des paramètres" }); }
      }),

      get: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          try {
            const value = await getSetting(input.key);
            return { key: input.key, value };
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du paramètre" }); }
        }),

      set: adminProcedure
        .input(z.object({ key: z.string(), value: z.string() }))
        .mutation(async ({ input }) => {
          try {
            await setSetting(input.key, input.value);
            return { success: true };
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la sauvegarde du paramètre" }); }
        }),
    }),

    /** Subscription plans pricing */
    subscriptionPlans: router({
      update: adminProcedure
        .input(z.object({
          tier: z.enum(["premium", "integral"]),
          monthlyPrice: z.string(),
          annualPrice: z.string(),
        }))
        .mutation(async ({ input }) => {
          try {
            await updateSubscriptionPlan(input.tier, input.monthlyPrice, input.annualPrice);
            return { success: true };
          } catch {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du plan" });
          }
        }),
    }),

    /** Notifications admin */
    notifications: router({
      /** Count recipients for a given preference */
      countTargets: adminProcedure
        .input(z.object({
          pref: z.enum(["notifNewsletter", "notifNewArticles", "notifInvestments", "notifTenders", "notifEvents"]),
          tier: z.enum(["all", "premium", "integral"]).optional(),
        }))
        .query(async ({ input }) => {
          const tier = input.tier && input.tier !== "all" ? input.tier : undefined;
          try { return { count: await countTargets(input.pref as NotifPreference, tier) }; }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du comptage" }); }
        }),

      /** Send newsletter broadcast to users matching a preference */
      send: adminProcedure
        .input(z.object({
          subject: z.string().min(1),
          html: z.string().min(1),
          pref: z.enum(["notifNewsletter", "notifNewArticles", "notifInvestments", "notifTenders", "notifEvents"]),
          tier: z.enum(["all", "premium", "integral"]).optional(),
        }))
        .mutation(async ({ input }) => {
          const tier = input.tier && input.tier !== "all" ? input.tier : undefined;
          try { return await sendNewsletterBroadcast(input.subject, input.html, input.pref as NotifPreference, tier); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'envoi de la notification" }); }
        }),

      /** Send a test email to a specific address */
      sendTest: adminProcedure
        .input(z.object({ email: z.string().email(), subject: z.string(), html: z.string() }))
        .mutation(async ({ input }) => {
          try {
            const { sendEmail } = await import("./_core/email");
            await sendEmail({ to: input.email, subject: `[TEST] ${input.subject}`, html: input.html });
            return { success: true };
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'envoi du test" }); }
        }),
    }),

    /** Community members CRUD */
    community: router({
      list: adminProcedure
        .input(z.object({
          category: z.string().optional(),
          country: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
          try { return await adminGetAllCommunityMembers(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des membres" }); }
        }),

      byId: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          try { return await adminGetCommunityMemberById(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du membre" }); }
        }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          role: z.string().optional(),
          company: z.string().optional(),
          country: z.string().optional(),
          category: z.string().optional(),
          bio: z.string().optional(),
          avatar: z.string().optional(),
          linkedin: z.string().optional(),
          email: z.string().optional(),
          verified: z.boolean().default(false),
          featured: z.boolean().default(false),
          published: z.boolean().default(true),
        }))
        .mutation(async ({ input }) => {
          try { return await adminCreateCommunityMember(input); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création du membre" }); }
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().nullable().optional(),
          company: z.string().nullable().optional(),
          country: z.string().nullable().optional(),
          category: z.string().nullable().optional(),
          bio: z.string().nullable().optional(),
          avatar: z.string().nullable().optional(),
          linkedin: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
          verified: z.boolean().optional(),
          featured: z.boolean().optional(),
          published: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const { id, ...data } = input;
            return await adminUpdateCommunityMember(id, data);
          } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du membre" }); }
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminDeleteCommunityMember(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression du membre" }); }
        }),

      toggleVerified: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          try { return await adminToggleCommunityMemberVerified(input.id); }
          catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification" }); }
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
    list: publicProcedure.query(async () => {
      try { return await getPublishedMagazineIssues(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des numéros" }); }
    }),

    /** Get issue by number (public) */
    byNumber: publicProcedure
      .input(z.object({ issueNumber: z.string() }))
      .query(async ({ input }) => {
        try { return await getMagazineIssueByNumber(input.issueNumber); }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement du numéro" }); }
      }),

    /** Track download */
    trackDownload: publicProcedure
      .input(z.object({ issueId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await incrementMagazineDownloadCount(input.issueId);
          return { success: true };
        } catch { return { success: false }; }
      }),
  }),

  magazine: router({
    /** Check if user has access to a specific magazine issue */
    checkAccess: publicProcedure
      .input(z.object({ issueId: z.string() }))
      .query(async ({ ctx, input }) => { try {
        const LAUNCH_END_DATE = await getLaunchEndDate();
        const isLaunchPeriod = new Date() < LAUNCH_END_DATE;

        const issueRecord = await getMagazineIssueByNumber(input.issueId);
        const isPremiumIssue = issueRecord ? issueRecord.isPremium : true;

        if (!isPremiumIssue) {
          if (!ctx.user) {
            return { hasAccess: false, reason: "not_authenticated" as const, isLaunchPeriod };
          }
          return { hasAccess: true, reason: "free" as const, isLaunchPeriod };
        }

        if (!ctx.user) {
          return { hasAccess: false, reason: "not_authenticated" as const, isLaunchPeriod };
        }

        if (ctx.user.role === "admin") {
          return { hasAccess: true, reason: "admin" as const, isLaunchPeriod };
        }

        if (isLaunchPeriod) {
          return { hasAccess: true, reason: "launch_promo" as const, isLaunchPeriod };
        }

        const tier = ctx.user.subscriptionTier;
        if (tier === "premium" || tier === "integral") {
          return { hasAccess: true, reason: "subscription" as const, isLaunchPeriod };
        }

        const activeSub = await getUserSubscription(ctx.user.id);
        if (
          activeSub &&
          activeSub.status === "active" &&
          (activeSub.tier === "premium" || activeSub.tier === "integral")
        ) {
          return { hasAccess: true, reason: "subscription" as const, isLaunchPeriod };
        }

        if (issueRecord) {
          const purchased = await hasUserPurchasedMagazine(ctx.user.id, issueRecord.id);
          if (purchased) {
            return { hasAccess: true, reason: "purchased" as const, isLaunchPeriod };
          }
        }

        return { hasAccess: false, reason: "no_subscription" as const, isLaunchPeriod };
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification d'accès" });
      } }),

    /** Get launch period status */
    launchStatus: publicProcedure.query(async () => {
      const LAUNCH_END_DATE = await getLaunchEndDate();
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
        try {
          const issue = await getMagazineIssueByNumber(input.issueNumber);
          if (!issue) return { purchased: false };
          const purchased = await hasUserPurchasedMagazine(ctx.user.id, issue.id);
          return { purchased };
        } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la vérification d'achat" }); }
      }),

    /** List user's purchased magazine issues */
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      try { return await listUserMagazinePurchases(ctx.user.id); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des achats" }); }
    }),

    /** Get magazine PDF unit price (dynamic, admin-configurable) */
    pdfPrice: publicProcedure.query(async () => {
      try {
        const raw = await getSetting("magazine_pdf_price");
        const amount = raw ? parseInt(raw, 10) : MAGAZINE_PDF_PRICE.amount;
        return {
          amount,
          currency: MAGAZINE_PDF_PRICE.currency,
          formatted: `${(amount / 100).toFixed(2).replace(".", ",")} €`,
        };
      } catch {
        return {
          amount: MAGAZINE_PDF_PRICE.amount,
          currency: MAGAZINE_PDF_PRICE.currency,
          formatted: `${(MAGAZINE_PDF_PRICE.amount / 100).toFixed(2).replace(".", ",")} €`,
        };
      }
    }),
  }),

  // ═══════════════════════════════════════════════
  // PUBLIC SITE SETTINGS
  // ═══════════════════════════════════════════════

  siteConfig: router({
    promo: publicProcedure.query(async () => {
      try {
        const [code, message] = await Promise.all([
          getSetting("promo_code_active"),
          getSetting("promo_message"),
        ]);
        return {
          code: code || null,
          message: message || null,
          active: !!(code && code.trim()),
        };
      } catch {
        return { code: null, message: null, active: false };
      }
    }),

    homepageSettings: publicProcedure
      .input(z.object({ keys: z.array(z.string()) }))
      .query(async ({ input }) => {
        try {
          const entries = await Promise.all(
            input.keys.map(async (key) => ({ key, value: await getSetting(key) ?? null }))
          );
          return Object.fromEntries(entries.map(e => [e.key, e.value]));
        } catch {
          return Object.fromEntries(input.keys.map(k => [k, null]));
        }
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
      .query(async ({ ctx, input }) => {
        try {
          const result = await getArchivedArticles(input);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const articles = result.articles.map((article) => {
            const access = canAccessArticle(ctx.user ?? null, article, activeSub);
            if (!access.allowed) return { ...stripPremiumContent(article), access };
            return { ...article, access };
          });
          return { articles, total: result.total };
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des archives" }); }
      }),

    /** Get available years for filtering */
    years: publicProcedure.query(async () => {
      try { return await getArticleYears(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des années" }); }
    }),

    /** Get available categories for filtering */
    categories: publicProcedure.query(async () => {
      try { return await adminGetCategories(); }
      catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des rubriques" }); }
    }),

    /** List archived magazine issues with filters */
    issues: publicProcedure
      .input(z.object({
        year: z.number().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const issues = await getArchivedMagazineIssues(input);
          const activeSub = ctx.user ? await getUserSubscription(ctx.user.id) : null;
          const canDownload = hasActiveSubscription(ctx.user, activeSub ?? null);
          return issues.map((issue) => {
            if (!issue.isPremium || canDownload) return issue;
            const { pdfUrl, pdfFileKey, ...safe } = issue;
            return { ...safe, pdfUrl: null, pdfFileKey: null };
          });
        }
        catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors du chargement des archives magazine" }); }
      }),
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
      .mutation(async ({ ctx, input }) => {
        try {
          const priority = ctx.user?.subscriptionTier === "integral" ? "priority" : "normal";
          const result = await submitContactMessage({ ...input, priority });
          // best-effort admin notification
          import("./_core/email").then(({ sendEmail }) => import("./_core/env").then(({ ENV }) =>
            sendEmail({
              to: ENV.emailFrom,
              subject: `[Contact Habari] ${input.subject}`,
              html: `<p><strong>De :</strong> ${input.name} &lt;${input.email}&gt;</p><p><strong>Catégorie :</strong> ${input.category}</p><p><strong>Message :</strong></p><p>${input.message.replace(/\n/g, "<br>")}</p>`,
            })
          )).catch(() => {});
          return result;
        } catch (e) {
          if (e instanceof TRPCError) throw e;
          console.error("[contact.submit]", e);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'envoi du message" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
