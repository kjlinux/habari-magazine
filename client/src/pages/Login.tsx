import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOGIN_URL, REGISTER_URL } from "@/const";
import { Loader2, Mail, Lock, User } from "lucide-react";

export default function Login() {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Email ou mot de passe incorrect.");
      }
      window.location.href = "/";
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la création du compte.");
      }
      window.location.href = "/";
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setRegisterLoading(false);
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
          <p className="text-sm text-muted-foreground font-sans">
            Connexion économique pour l'intégration de l'Afrique Centrale
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="font-serif text-xl text-center text-primary">
              Accéder à votre espace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1 font-sans">Se connecter</TabsTrigger>
                <TabsTrigger value="register" className="flex-1 font-sans">Créer un compte</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-sans text-sm flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-sans text-sm flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Mot de passe
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  {loginError && (
                    <p className="text-sm text-destructive font-sans">{loginError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full font-sans bg-primary hover:bg-primary/90"
                    disabled={loginLoading}
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="font-sans text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" /> Nom complet
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="font-sans text-sm flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="font-sans text-sm flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Mot de passe
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  {registerError && (
                    <p className="text-sm text-destructive font-sans">{registerError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full font-sans bg-primary hover:bg-primary/90"
                    disabled={registerLoading}
                  >
                    {registerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
