import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function UnsubscribeNewsletter() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");
  const unsub = trpc.newsletter.unsubscribeByToken.useMutation();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Lien invalide."); return; }
    unsub.mutateAsync({ token })
      .then(() => { setStatus("ok"); })
      .catch((e) => { setStatus("error"); setMessage(e?.message || "Lien invalide."); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Désinscription newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p>Traitement en cours…</p>
            </div>
          )}
          {status === "ok" && (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="font-medium">Vous avez été désinscrit avec succès.</p>
              <p className="text-sm text-muted-foreground">Vous ne recevrez plus la newsletter Habari Magazine.</p>
              <Link href="/" className="text-primary hover:underline mt-4">Retour à l'accueil</Link>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-2 py-8">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">Lien invalide</p>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link href="/" className="text-primary hover:underline mt-4">Retour à l'accueil</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
