import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Trend = "up" | "down" | "stable";
type Category = "macro" | "commodity";

interface IndicatorForm {
  label: string;
  value: string;
  trend: Trend;
  delta: string;
  category: Category;
  periodLabel: string;
  sortOrder: number;
}

const defaultForm: IndicatorForm = {
  label: "",
  value: "",
  trend: "stable",
  delta: "",
  category: "macro",
  periodLabel: "",
  sortOrder: 0,
};

const trendConfig: Record<Trend, { label: string; icon: React.ReactNode; color: string }> = {
  up: { label: "Hausse", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-600" },
  down: { label: "Baisse", icon: <TrendingDown className="w-4 h-4" />, color: "text-red-600" },
  stable: { label: "Stable", icon: <Minus className="w-4 h-4" />, color: "text-muted-foreground" },
};

const categoryLabels: Record<Category, string> = {
  macro: "Macro",
  commodity: "Matière première",
};

export default function AdminEconomicIndicators() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IndicatorForm>(defaultForm);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.economicIndicators.list.useQuery();

  const invalidate = () => utils.admin.economicIndicators.list.invalidate();

  const createMutation = trpc.admin.economicIndicators.create.useMutation({
    onSuccess: () => {
      toast.success("Indicateur créé");
      invalidate();
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la création"),
  });

  const updateMutation = trpc.admin.economicIndicators.update.useMutation({
    onSuccess: () => {
      toast.success("Indicateur mis à jour");
      invalidate();
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la mise à jour"),
  });

  const deleteMutation = trpc.admin.economicIndicators.delete.useMutation({
    onSuccess: () => {
      toast.success("Indicateur supprimé");
      invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la suppression"),
  });

  const items = data ?? [];

  function resetForm() {
    setForm(defaultForm);
    setShowForm(false);
    setEditId(null);
  }

  function openCreate() {
    setForm(defaultForm);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(item: any) {
    setForm({
      label: item.label ?? "",
      value: item.value ?? "",
      trend: item.trend ?? "stable",
      delta: item.delta ?? "",
      category: item.category ?? "macro",
      periodLabel: item.periodLabel ?? "",
      sortOrder: item.sortOrder ?? 0,
    });
    setEditId(item.id);
    setShowForm(true);
  }

  function handleSubmit() {
    const payload = {
      label: form.label,
      value: form.value,
      trend: form.trend,
      delta: form.delta || undefined,
      category: form.category,
      periodLabel: form.periodLabel || undefined,
      sortOrder: form.sortOrder,
    };

    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Indicateurs économiques</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les indicateurs affichés sur le tableau de bord
            </p>
          </div>
          <Button className="font-sans gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Ajouter un indicateur
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans mb-4">Aucun indicateur trouvé</p>
            <Button className="font-sans gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Créer un indicateur
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Label</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Valeur</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tendance</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Delta</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Période</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ordre</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => {
                      const trend = trendConfig[item.trend as Trend] ?? trendConfig.stable;
                      return (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{item.label}</td>
                          <td className="px-4 py-3 text-foreground">{item.value}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 ${trend.color}`}>
                              {trend.icon}
                              <span className="hidden sm:inline">{trend.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.delta ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                              {categoryLabels[item.category as Category] ?? item.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.periodLabel ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.sortOrder}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost" size="sm" className="h-8 w-8 p-0"
                                title="Modifier" onClick={() => openEdit(item)}
                              >
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-8 w-8 p-0"
                                title="Supprimer" onClick={() => setDeleteId(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Formulaire création / modification */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editId !== null ? "Modifier l'indicateur" : "Ajouter un indicateur"}
            </DialogTitle>
            <DialogDescription className="font-sans">
              Remplissez les champs puis enregistrez.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium font-sans">Label <span className="text-destructive">*</span></label>
              <Input
                placeholder="Ex. PIB Côte d'Ivoire"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium font-sans">Valeur <span className="text-destructive">*</span></label>
              <Input
                placeholder="Ex. +6,2%"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium font-sans">Tendance <span className="text-destructive">*</span></label>
                <Select value={form.trend} onValueChange={(v) => setForm({ ...form, trend: v as Trend })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Hausse</SelectItem>
                    <SelectItem value="down">Baisse</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium font-sans">Catégorie <span className="text-destructive">*</span></label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macro">Macro</SelectItem>
                    <SelectItem value="commodity">Matière première</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium font-sans">Delta <span className="text-muted-foreground text-xs">(optionnel)</span></label>
              <Input
                placeholder="Ex. +0,3 pts"
                value={form.delta}
                onChange={(e) => setForm({ ...form, delta: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium font-sans">Période <span className="text-muted-foreground text-xs">(optionnel)</span></label>
              <Input
                placeholder="Ex. T1 2025"
                value={form.periodLabel}
                onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium font-sans">Ordre d'affichage <span className="text-destructive">*</span></label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="font-sans">Annuler</Button>
            <Button
              className="font-sans"
              disabled={isMutating || !form.label.trim() || !form.value.trim()}
              onClick={handleSubmit}
            >
              {isMutating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editId !== null ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmer la suppression</DialogTitle>
            <DialogDescription className="font-sans">
              Cette action est irréversible. L'indicateur sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-sans">Annuler</Button>
            <Button
              variant="destructive" className="font-sans"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
