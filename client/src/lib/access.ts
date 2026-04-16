export type AccessReason =
  | "free"
  | "trial"
  | "subscription"
  | "admin"
  | "launch_promo"
  | "not_authenticated"
  | "trial_expired"
  | "no_subscription";

export type AccessInfo = {
  allowed: boolean;
  reason: AccessReason;
  trialDaysRemaining: number;
  isLaunchPeriod: boolean;
};

export function paywallCta(reason: AccessReason): { label: string; href: string } {
  switch (reason) {
    case "not_authenticated":
      return { label: "Créer un compte gratuit", href: "/login" };
    case "trial_expired":
    case "no_subscription":
      return { label: "S'abonner", href: "/abonnements" };
    default:
      return { label: "S'abonner", href: "/abonnements" };
  }
}

export function paywallMessage(reason: AccessReason, trialDaysRemaining = 0): string {
  switch (reason) {
    case "not_authenticated":
      return "Cet article est réservé aux membres. Créez un compte gratuit pour profiter de 3 mois d'accès Premium offerts.";
    case "trial_expired":
      return "Votre période d'essai gratuite de 3 mois est terminée. Abonnez-vous pour continuer à lire les contenus Premium.";
    case "no_subscription":
      return "Cet article fait partie de l'offre Premium. Abonnez-vous pour y accéder.";
    case "trial":
      return `Il vous reste ${trialDaysRemaining} jour${trialDaysRemaining > 1 ? "s" : ""} d'accès Premium gratuit.`;
    default:
      return "";
  }
}
