import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  Reply,
  Archive,
  Trash2,
  ChevronLeft,
  Clock,
  User,
  Tag,
  Loader2,
  Inbox,
  Filter,
} from "lucide-react";

const statusLabels: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  new: { label: "Nouveau", color: "bg-blue-100 text-blue-700", icon: Mail },
  read: { label: "Lu", color: "bg-gray-100 text-gray-700", icon: MailOpen },
  replied: { label: "Répondu", color: "bg-green-100 text-green-700", icon: Reply },
  archived: { label: "Archivé", color: "bg-amber-100 text-amber-700", icon: Archive },
};

const categoryLabels: Record<string, string> = {
  general: "Question générale",
  editorial: "Proposition éditoriale",
  partnership: "Demande de partenariat",
  advertising: "Publicité & Sponsoring",
  subscription: "Abonnement & Accès",
  other: "Autre",
};

export default function AdminContact() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: messages, isLoading, refetch } = trpc.admin.contact.list.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: countNew } = trpc.admin.contact.countNew.useQuery();

  const { data: selectedMessage, isLoading: loadingMessage } = trpc.admin.contact.byId.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  );

  const updateStatusMutation = trpc.admin.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = trpc.admin.contact.delete.useMutation({
    onSuccess: () => {
      toast.success("Message supprimé");
      setSelectedId(null);
      refetch();
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleOpenMessage = (id: number, status: string) => {
    setSelectedId(id);
    if (status === "new") {
      updateStatusMutation.mutate({ id, status: "read" });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Detail view
  if (selectedId && selectedMessage) {
    const status = statusLabels[selectedMessage.status] ?? statusLabels.new;
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground font-sans text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour aux messages
          </button>

          {/* Message card */}
          <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/20">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {selectedMessage.subject}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} shrink-0`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-foreground/60">
                  <User className="w-4 h-4" />
                  <span className="font-sans">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/60">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${selectedMessage.email}`} className="font-sans text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-foreground/60">
                  <Tag className="w-4 h-4" />
                  <span className="font-sans">{categoryLabels[selectedMessage.category] ?? selectedMessage.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-foreground/40 text-xs mt-3">
                <Clock className="w-3 h-3" />
                <span className="font-sans">Reçu le {formatDate(selectedMessage.createdAt)}</span>
                {selectedMessage.repliedAt && (
                  <span className="font-sans ml-4">• Répondu le {formatDate(selectedMessage.repliedAt)}</span>
                )}
              </div>
            </div>

            {/* Message body */}
            <div className="p-6">
              <p className="font-sans text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border bg-muted/10 flex flex-wrap gap-3">
              <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                <Button className="font-sans bg-primary hover:bg-primary/90" size="sm">
                  <Reply className="w-4 h-4 mr-2" />
                  Répondre par email
                </Button>
              </a>

              {selectedMessage.status !== "replied" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-sans"
                  onClick={() => updateStatusMutation.mutate({ id: selectedMessage.id, status: "replied" })}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Marquer comme répondu
                </Button>
              )}

              {selectedMessage.status !== "archived" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-sans"
                  onClick={() => updateStatusMutation.mutate({ id: selectedMessage.id, status: "archived" })}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="font-sans text-red-600 border-red-200 hover:bg-red-50 ml-auto"
                onClick={() => {
                  if (confirm("Supprimer ce message définitivement ?")) {
                    deleteMutation.mutate({ id: selectedMessage.id });
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Loading detail
  if (selectedId && loadingMessage) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // List view
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Messages de contact
            </h1>
            <p className="font-sans text-sm text-foreground/60 mt-1">
              {countNew ? `${countNew} nouveau${countNew > 1 ? "x" : ""} message${countNew > 1 ? "s" : ""}` : "Aucun nouveau message"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-foreground/40" />
          {[
            { value: "all", label: "Tous" },
            { value: "new", label: "Nouveaux" },
            { value: "read", label: "Lus" },
            { value: "replied", label: "Répondus" },
            { value: "archived", label: "Archivés" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg font-sans text-sm transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Messages list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="font-sans text-foreground/40">Aucun message trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              const status = statusLabels[msg.status] ?? statusLabels.new;
              const StatusIcon = status.icon;
              return (
                <button
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg.id, msg.status)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm ${
                    msg.status === "new"
                      ? "bg-blue-50/50 border-blue-200 hover:border-blue-300"
                      : "bg-background border-border hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.status === "new" ? "bg-blue-100" : "bg-muted/50"
                    }`}>
                      <StatusIcon className={`w-5 h-5 ${
                        msg.status === "new" ? "text-blue-600" : "text-foreground/40"
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-sans text-sm ${
                          msg.status === "new" ? "font-bold text-foreground" : "font-medium text-foreground/80"
                        }`}>
                          {msg.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground/50">
                          {categoryLabels[msg.category] ?? msg.category}
                        </span>
                      </div>
                      <p className={`font-sans text-sm truncate ${
                        msg.status === "new" ? "font-semibold text-foreground" : "text-foreground/70"
                      }`}>
                        {msg.subject}
                      </p>
                      <p className="font-sans text-xs text-foreground/40 truncate mt-0.5">
                        {msg.message.substring(0, 120)}...
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-sans text-xs text-foreground/40">
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
