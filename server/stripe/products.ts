/**
 * Habari Stripe Products & Prices
 * 
 * Defines the subscription plans and newsletter tiers available for purchase.
 * Prices are in EUR (cents).
 */

export const HABARI_PRODUCTS = {
  // ═══════════════════════════════════════════════
  // SITE PREMIUM ACCESS
  // ═══════════════════════════════════════════════
  premiumAccess: {
    name: "Habari Premium — Accès complet",
    description: "Dossiers complets, archives, analyses pays, tribunes exclusives, espace investisseurs",
    prices: {
      monthly: {
        amount: 450, // 4.50 €
        currency: "eur",
        interval: "month" as const,
        label: "4,50 €/mois",
      },
      annual: {
        amount: 4500, // 45.00 € (2 mois offerts)
        currency: "eur",
        interval: "year" as const,
        label: "45 €/an (2 mois offerts)",
      },
    },
  },

  // ═══════════════════════════════════════════════
  // NEWSLETTER PREMIUM
  // ═══════════════════════════════════════════════
  newsletterPremium: {
    name: "Newsletter Premium Habari",
    description: "Analyse approfondie hebdomadaire, données exclusives, archives complètes, invitations événements",
    prices: {
      monthly: {
        amount: 500, // 5.00 €
        currency: "eur",
        interval: "month" as const,
        label: "5 €/mois",
      },
      annual: {
        amount: 5000, // 50.00 € (2 mois offerts)
        currency: "eur",
        interval: "year" as const,
        label: "50 €/an (2 mois offerts)",
      },
    },
  },

  // ═══════════════════════════════════════════════
  // BUNDLE: PREMIUM + NEWSLETTER
  // ═══════════════════════════════════════════════
  bundle: {
    name: "Habari Intégral — Premium + Newsletter",
    description: "Accès complet au site + newsletter premium. La formule la plus avantageuse.",
    prices: {
      monthly: {
        amount: 900, // 9.00 € (au lieu de 9,50 €)
        currency: "eur",
        interval: "month" as const,
        label: "9 €/mois (au lieu de 9,50 €)",
      },
      annual: {
        amount: 9000, // 90.00 € (au lieu de 114 €)
        currency: "eur",
        interval: "year" as const,
        label: "90 €/an (au lieu de 114 €)",
      },
    },
  },
} as const;

export type ProductKey = keyof typeof HABARI_PRODUCTS;
export type PriceInterval = "monthly" | "annual";
