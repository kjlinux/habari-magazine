import { Link } from "wouter";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { paywallCta, paywallMessage, type AccessReason, type SubscriptionTier } from "@/lib/access";

type PaywallProps = {
  reason: AccessReason;
  trialDaysRemaining?: number;
  excerpt?: string | null;
  requiredTier?: SubscriptionTier;
};

export default function Paywall({ reason, trialDaysRemaining = 0, excerpt, requiredTier }: PaywallProps) {
  const cta = paywallCta(reason, requiredTier);
  const message = paywallMessage(reason, trialDaysRemaining, requiredTier);

  return (
    <div className="relative my-8">
      {excerpt && (
        <div className="relative max-h-48 overflow-hidden">
          <p className="text-muted-foreground leading-relaxed">{excerpt}</p>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}
      <Card className="mt-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Contenu Premium
            </h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href={cta.href}>
              <Button size="lg" className="min-w-[200px]">
                {cta.label}
              </Button>
            </Link>
            {reason === "not_authenticated" && (
              <Link href="/abonnements">
                <Button size="lg" variant="outline">
                  Voir les formules
                </Button>
              </Link>
            )}
          </div>
          {reason === "not_authenticated" && (
            <p className="text-xs text-muted-foreground mt-2">
              Déjà inscrit ?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Se connecter
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
