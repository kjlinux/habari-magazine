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

export type SubscriptionTier = "free" | "premium" | "integral";

export type AccessInfo = {
  allowed: boolean;
  reason: AccessReason;
  trialDaysRemaining: number;
  isLaunchPeriod: boolean;
  requiredTier?: SubscriptionTier;
};

const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: "Accès libre",
  premium: "Accès Premium",
  integral: "Habari Intégral",
};

export function paywallCta(reason: AccessReason, requiredTier?: SubscriptionTier): { label: string; href: string } {
  if (reason === "not_authenticated") {
    return { label: "Créer un compte gratuit", href: "/login" };
  }
  if (reason === "tier_insufficient" && requiredTier === "integral") {
    return { label: "Passer à Habari Intégral", href: "/abonnements" };
  }
  if (reason === "tier_insufficient" && requiredTier === "premium") {
    return { label: "Passer à Premium", href: "/abonnements" };
  }
  return { label: "S'abonner", href: "/abonnements" };
}

export function paywallMessage(reason: AccessReason, trialDaysRemaining = 0, requiredTier?: SubscriptionTier): string {
  switch (reason) {
    case "not_authenticated":
      return "Ce contenu est réservé aux membres. Créez un compte gratuit pour profiter de 3 mois d'accès Premium offerts.";
    case "trial_expired":
      return "Votre période d'essai gratuite de 3 mois est terminée. Abonnez-vous pour continuer à accéder aux contenus Premium.";
    case "no_subscription":
      return "Ce contenu fait partie de l'offre Premium. Abonnez-vous pour y accéder.";
    case "tier_insufficient": {
      const label = requiredTier ? TIER_LABEL[requiredTier] : "Premium";
      return `Ce contenu nécessite la formule ${label}. Mettez à niveau votre abonnement pour y accéder.`;
    }
    case "trial":
      return `Il vous reste ${trialDaysRemaining} jour${trialDaysRemaining > 1 ? "s" : ""} d'accès Premium gratuit.`;
    default:
      return "";
  }
}
