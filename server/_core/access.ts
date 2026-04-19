import type { User, Article, UserSubscription } from "../../drizzle/schema";

export const TRIAL_DURATION_DAYS = 90;
export const LAUNCH_END_DATE = new Date("2026-06-01T00:00:00Z");
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type SubscriptionTier = "free" | "premium" | "integral";

export const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  integral: 2,
};

export function tierMeets(userTier: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

export type AccessReason =
  | "free"
  | "trial"
  | "subscription"
  | "admin"
  | "launch_promo"
  | "not_authenticated"
  | "trial_expired"
  | "no_subscription"
  | "tier_insufficient";

export type AccessResult = {
  allowed: boolean;
  reason: AccessReason;
  trialDaysRemaining: number;
  isLaunchPeriod: boolean;
  requiredTier?: SubscriptionTier;
};

export function isLaunchPeriod(now: Date = new Date()): boolean {
  return now < LAUNCH_END_DATE;
}

export function getTrialDaysRemaining(user: Pick<User, "createdAt"> | null): number {
  if (!user) return 0;
  const created = new Date(user.createdAt).getTime();
  const expires = created + TRIAL_DURATION_DAYS * MS_PER_DAY;
  const remaining = Math.ceil((expires - Date.now()) / MS_PER_DAY);
  return Math.max(0, remaining);
}

export function getEffectiveTier(
  user: Pick<User, "subscriptionTier"> | null,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): SubscriptionTier {
  if (!user) return "free";
  const userTier = user.subscriptionTier as SubscriptionTier;
  const subTier =
    activeSub && activeSub.status === "active"
      ? (activeSub.tier as SubscriptionTier)
      : "free";
  return TIER_RANK[userTier] >= TIER_RANK[subTier] ? userTier : subTier;
}

export function hasActiveSubscription(
  user: Pick<User, "subscriptionTier"> | null,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): boolean {
  return tierMeets(getEffectiveTier(user, activeSub), "premium");
}

export function hasIntegral(
  user: Pick<User, "subscriptionTier"> | null,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): boolean {
  return tierMeets(getEffectiveTier(user, activeSub), "integral");
}

/**
 * Newsletter Premium access: orthogonal to site tier. True if user has the
 * newsletter-only subscription OR is on Intégral (which bundles both).
 */
export function hasNewsletterPremium(
  user: Pick<User, "subscriptionTier" | "hasNewsletterPremium"> | null,
): boolean {
  if (!user) return false;
  if (user.hasNewsletterPremium) return true;
  return user.subscriptionTier === "integral";
}

export function canAccess(
  user: User | null,
  minTier: SubscriptionTier,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): AccessResult {
  const launch = isLaunchPeriod();
  const trialDaysRemaining = getTrialDaysRemaining(user);

  if (minTier === "free") {
    return { allowed: true, reason: "free", trialDaysRemaining, isLaunchPeriod: launch, requiredTier: minTier };
  }

  if (!user) {
    return { allowed: false, reason: "not_authenticated", trialDaysRemaining: 0, isLaunchPeriod: launch, requiredTier: minTier };
  }

  if (user.role === "admin") {
    return { allowed: true, reason: "admin", trialDaysRemaining, isLaunchPeriod: launch, requiredTier: minTier };
  }

  const effective = getEffectiveTier(user, activeSub);
  if (tierMeets(effective, minTier)) {
    return { allowed: true, reason: "subscription", trialDaysRemaining, isLaunchPeriod: launch, requiredTier: minTier };
  }

  if (launch) {
    return { allowed: true, reason: "launch_promo", trialDaysRemaining, isLaunchPeriod: launch, requiredTier: minTier };
  }

  if (trialDaysRemaining > 0) {
    return { allowed: true, reason: "trial", trialDaysRemaining, isLaunchPeriod: launch, requiredTier: minTier };
  }

  if (effective !== "free") {
    return { allowed: false, reason: "tier_insufficient", trialDaysRemaining: 0, isLaunchPeriod: launch, requiredTier: minTier };
  }
  return { allowed: false, reason: "trial_expired", trialDaysRemaining: 0, isLaunchPeriod: launch, requiredTier: minTier };
}

export function canAccessArticle(
  user: User | null,
  article: Pick<Article, "minSubscriptionTier">,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): AccessResult {
  return canAccess(user, article.minSubscriptionTier as SubscriptionTier, activeSub);
}

export function stripPremiumContent<T extends { content?: string | null; excerpt?: string | null }>(
  article: T,
  excerptMaxLen = 300,
): T {
  const truncatedExcerpt = article.excerpt
    ? article.excerpt.length > excerptMaxLen
      ? article.excerpt.slice(0, excerptMaxLen).trim() + "…"
      : article.excerpt
    : null;
  return { ...article, content: "", excerpt: truncatedExcerpt };
}
