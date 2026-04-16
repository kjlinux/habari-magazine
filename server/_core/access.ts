import type { User, Article, UserSubscription } from "../../drizzle/schema";

export const TRIAL_DURATION_DAYS = 90;
export const LAUNCH_END_DATE = new Date("2026-06-01T00:00:00Z");
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type AccessReason =
  | "free"
  | "trial"
  | "subscription"
  | "admin"
  | "launch_promo"
  | "not_authenticated"
  | "trial_expired"
  | "no_subscription";

export type AccessResult = {
  allowed: boolean;
  reason: AccessReason;
  trialDaysRemaining: number;
  isLaunchPeriod: boolean;
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

export function hasActiveSubscription(
  user: Pick<User, "subscriptionTier"> | null,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): boolean {
  if (!user) return false;
  const tier = user.subscriptionTier;
  if (tier === "premium" || tier === "enterprise" || tier === "standard") return true;
  if (
    activeSub &&
    activeSub.status === "active" &&
    (activeSub.tier === "premium" || activeSub.tier === "enterprise" || activeSub.tier === "standard")
  ) {
    return true;
  }
  return false;
}

export function canAccessArticle(
  user: User | null,
  article: Pick<Article, "minSubscriptionTier">,
  activeSub?: Pick<UserSubscription, "tier" | "status"> | null,
): AccessResult {
  const launch = isLaunchPeriod();
  const trialDaysRemaining = getTrialDaysRemaining(user);

  if (article.minSubscriptionTier === "free") {
    return { allowed: true, reason: "free", trialDaysRemaining, isLaunchPeriod: launch };
  }

  if (!user) {
    return { allowed: false, reason: "not_authenticated", trialDaysRemaining: 0, isLaunchPeriod: launch };
  }

  if (user.role === "admin") {
    return { allowed: true, reason: "admin", trialDaysRemaining, isLaunchPeriod: launch };
  }

  if (hasActiveSubscription(user, activeSub)) {
    return { allowed: true, reason: "subscription", trialDaysRemaining, isLaunchPeriod: launch };
  }

  if (launch) {
    return { allowed: true, reason: "launch_promo", trialDaysRemaining, isLaunchPeriod: launch };
  }

  if (trialDaysRemaining > 0) {
    return { allowed: true, reason: "trial", trialDaysRemaining, isLaunchPeriod: launch };
  }

  return { allowed: false, reason: "trial_expired", trialDaysRemaining: 0, isLaunchPeriod: launch };
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
