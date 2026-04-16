import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const DISMISS_KEY = "habari_trial_banner_dismissed_at";
const REDISPLAY_AFTER_MS = 1000 * 60 * 60 * 24;

export default function TrialBanner() {
  const [dismissed, setDismissed] = useState(true);
  const { data } = trpc.auth.trialStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
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

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

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
