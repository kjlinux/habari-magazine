import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Bell, Send, Users, Loader2, TestTube } from "lucide-react";
import RichEditor from "@/components/RichEditor";
import { useAuth } from "@/_core/hooks/useAuth";

type Pref = "notifNewsletter" | "notifNewArticles" | "notifInvestments" | "notifTenders" | "notifEvents";

const PREF_OPTIONS: { value: Pref; label: string; desc: string }[] = [
  { value: "notifNewsletter", label: "Newsletter hebdomadaire", desc: "Tous les abonnés à la newsletter" },
  { value: "notifNewArticles", label: "Nouveaux articles", desc: "Utilisateurs notifiés des nouveaux articles" },
  { value: "notifInvestments", label: "Alertes investissements", desc: "Utilisateurs intéressés par les investissements (AMI)" },
  { value: "notifTenders", label: "Appels d'offres", desc: "Utilisateurs intéressés par les appels d'offres" },
  { value: "notifEvents", label: "Événements", desc: "Utilisateurs abonnés aux rappels d'événements" },
];

export default function AdminNotifications() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [pref, setPref] = useState<Pref>("notifNewsletter");
  const [testEmail, setTestEmail] = useState(user?.email || "");
  const [confirmed, setConfirmed] = useState(false);

  const { data: countData, isLoading: countLoading } = trpc.admin.notifications.countTargets.useQuery(
    { pref },
    { refetchOnWindowFocus: false }
  );

  const sendMutation = trpc.admin.notifications.send.useMutation({
    onSuccess: (data) => {
      toast.success(`Envoyé à ${data.sent} destinataire(s)`);
      setConfirmed(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const testMutation = trpc.admin.notifications.sendTest.useMutation({
    onSuccess: () => toast.success("Email de test envoyé"),
    onError: (e) => toast.error(e.message),
  });

  const canSend = subject.trim().length > 0 && html.trim().length > 0;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Rédigez et envoyez des notifications email + push aux utilisateurs selon leurs préférences.
          </p>
        </div>

        {/* Type de destinataires */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-primary">Destinataires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREF_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPref(opt.value)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  pref === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <p className="font-sans text-sm font-medium">{opt.label}</p>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 text-sm font-sans">
            <Users className="w-4 h-4 text-primary" />
            {countLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>
                <strong>{countData?.count ?? 0}</strong> destinataire(s) pour cette préférence
              </span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-primary">Contenu</h2>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Objet de l'email *</Label>
            <Input
              placeholder="Ex: Newsletter Habari — Avril 2026"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="font-sans"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Contenu *</Label>
            <RichEditor value={html} onChange={setHtml} placeholder="Rédigez votre message ici..." />
          </div>
        </div>

        {/* Test email */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
            <TestTube className="w-5 h-5" /> Envoyer un test
          </h2>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="font-sans flex-1"
            />
            <Button
              variant="outline"
              onClick={() => testMutation.mutate({ email: testEmail, subject, html })}
              disabled={!canSend || !testEmail || testMutation.isPending}
              className="font-sans shrink-0"
            >
              {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le test"}
            </Button>
          </div>
        </div>

        {/* Envoi */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-primary">Envoyer à tous</h2>
          {!confirmed ? (
            <Button
              onClick={() => setConfirmed(true)}
              disabled={!canSend || (countData?.count ?? 0) === 0}
              className="font-sans bg-primary hover:bg-primary/90 gap-2"
            >
              <Send className="w-4 h-4" />
              Préparer l'envoi à {countData?.count ?? 0} destinataire(s)
            </Button>
          ) : (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg space-y-3">
              <p className="font-sans text-sm text-destructive font-medium">
                ⚠️ Vous allez envoyer "{subject}" à {countData?.count ?? 0} utilisateur(s). Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => sendMutation.mutate({ subject, html, pref })}
                  disabled={sendMutation.isPending}
                  className="font-sans bg-destructive hover:bg-destructive/90 gap-2"
                >
                  {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Confirmer l'envoi
                </Button>
                <Button variant="outline" onClick={() => setConfirmed(false)} className="font-sans">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
