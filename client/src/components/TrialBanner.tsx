import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Sparkles, X, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";

const DISMISS_KEY = "habari_trial_banner_dismissed_at";
const REDISPLAY_AFTER_MS = 1000 * 60 * 60 * 24;

export default function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data } = trpc.auth.trialStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  const { data: promo } = trpc.siteConfig.promo.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    const ts = typeof window !== "undefined" ? localStorage.getItem(DISMISS_KEY) : null;
    if (!ts) {
      setDismissed(false);
      return;
    }
    const elapsed = Date.now() - Number(ts);
    setDismissed(elapsed < REDISPLAY_AFTER_MS);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  // Bannière code promo (visible pour tous, même non connectés)
  if (promo?.active && !dismissed) {
    return (
      <div className="bg-[oklch(0.72_0.15_75)]/15 border-b border-[oklch(0.72_0.15_75)]/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-4 h-4 text-[oklch(0.50_0.15_75)] shrink-0" />
            <span className="truncate">
              {promo.message && <span>{promo.message} — </span>}
              Utilisez le code{" "}
              <span className="font-mono font-bold bg-[oklch(0.72_0.15_75)]/20 px-1.5 py-0.5 rounded text-[oklch(0.40_0.15_75)]">
                {promo.code}
              </span>{" "}
              lors du paiement
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/abonnements" className="font-medium text-[oklch(0.45_0.15_75)] hover:underline whitespace-nowrap">
              S'abonner
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fermer la bannière"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.authenticated || data.hasActiveSubscription || dismissed) {
    return null;
  }

  const { daysRemaining, isLaunchPeriod } = data;

  let message: string;
  if (isLaunchPeriod) {
    message = "Période de lancement : accès Premium offert à tous les membres jusqu'au 1er juin 2026.";
  } else if (daysRemaining > 0) {
    message = `Il vous reste ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} d'accès Premium gratuit.`;
  } else {
    message = "Votre période d'essai gratuite est terminée. Abonnez-vous pour continuer à lire les contenus Premium.";
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{message}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/abonnements" className="font-medium text-primary hover:underline whitespace-nowrap">
            S'abonner
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer la bannière"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
