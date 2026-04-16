import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue.");
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

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
              Mot de passe oublié
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif font-bold text-lg">Demande envoyée</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez
                  un lien de réinitialisation. Vérifiez également vos spams.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="font-sans mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground font-sans">
                  Entrez votre adresse email. Si un compte existe, nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="font-sans text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="font-sans"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-sans">{error}</p>}
                <Button type="submit" className="w-full font-sans bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le lien"}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-xs text-muted-foreground hover:text-primary font-sans underline">
                    Retour à la connexion
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
