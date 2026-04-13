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
        amount: 1000, // 10.00 €
        currency: "eur",
        interval: "month" as const,
        label: "10 €/mois",
      },
      annual: {
        amount: 10000, // 100.00 € (2 mois offerts)
        currency: "eur",
        interval: "year" as const,
        label: "100 €/an (2 mois offerts)",
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
        amount: 1500, // 15.00 €
        currency: "eur",
        interval: "month" as const,
        label: "15 €/mois",
      },
      annual: {
        amount: 15000, // 150.00 € (2 mois offerts)
        currency: "eur",
        interval: "year" as const,
        label: "150 €/an (2 mois offerts)",
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
        amount: 2000, // 20.00 € (au lieu de 25 €)
        currency: "eur",
        interval: "month" as const,
        label: "20 €/mois (au lieu de 25 €)",
      },
      annual: {
        amount: 20000, // 200.00 € (au lieu de 300 €)
        currency: "eur",
        interval: "year" as const,
        label: "200 €/an (au lieu de 300 €)",
      },
    },
  },
} as const;

export type ProductKey = keyof typeof HABARI_PRODUCTS;
export type PriceInterval = "monthly" | "annual";
