import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        setTokenValid(data.valid);
        setEmail(data.email || null);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue.");
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.005_250)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/logoHABARI_transparent_b638ce27.png"
              alt="Habari Magazine"
              className="h-12 w-auto mx-auto mb-4"
            />
          </a>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-center text-primary">
              Réinitialiser le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!tokenValid ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-serif font-bold text-lg">Lien invalide ou expiré</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Ce lien de réinitialisation n'est plus valide. Veuillez refaire une demande.
                </p>
                <Link href="/mot-de-passe-oublie">
                  <Button className="font-sans bg-primary hover:bg-primary/90 mt-2">
                    Nouvelle demande
                  </Button>
                </Link>
              </div>
            ) : done ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif font-bold text-lg">Mot de passe modifié</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <Link href="/login">
                  <Button className="font-sans bg-primary hover:bg-primary/90 mt-2">
                    Se connecter
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {email && (
                  <p className="text-sm text-muted-foreground font-sans">
                    Nouveau mot de passe pour <strong>{email}</strong>
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="font-sans text-sm flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Nouveau mot de passe
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="font-sans"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-sans text-sm flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Confirmer
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="font-sans"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-sans">{error}</p>}
                <Button type="submit" className="w-full font-sans bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Réinitialiser"}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-xs text-muted-foreground hover:text-primary font-sans underline">
                    <ArrowLeft className="w-3 h-3 inline mr-1" /> Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
