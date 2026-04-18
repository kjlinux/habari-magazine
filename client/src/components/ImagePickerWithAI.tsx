import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImagePickerWithAIProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  aiPromptContext: string;
  uploadEndpoint: string;
  label?: string;
  previewHeight?: string;
}

export default function ImagePickerWithAI({
  value,
  onChange,
  folder,
  aiPromptContext,
  uploadEndpoint,
  label,
  previewHeight = "h-48",
}: ImagePickerWithAIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Erreur ${res.status}`);
      }
      const { url } = await res.json();
      onChange(url);
      toast.success("Image uploadée avec succès");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const generateImage = async () => {
    if (!aiPromptContext.trim()) {
      toast.error("Remplissez d'abord le titre ou le contexte de l'article");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: aiPromptContext, folder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Erreur ${res.status}`);
      }
      const { url } = await res.json();
      onChange(url);
      toast.success("Image générée et appliquée");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-sans font-medium text-foreground mb-1.5">{label}</label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border group">
          <img src={value} alt="Aperçu" className={`w-full ${previewHeight} object-cover`} onError={(e) => (e.currentTarget.style.display = "none")} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading || generating} className="font-sans text-xs">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
              Remplacer
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={generateImage} disabled={generating || uploading} className="font-sans text-xs">
              {generating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
              {generating ? "Génération..." : "Regénérer IA"}
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")} disabled={generating} className="font-sans text-xs">
              <X className="w-3 h-3 mr-1" /> Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || generating}
            className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-sans font-medium">Uploader une image</div>
                  <div className="text-xs font-sans">JPG, PNG, WebP — max 50 Mo</div>
                </div>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={generateImage}
            disabled={generating || uploading}
            className="w-full h-24 rounded-lg border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-3 text-primary/70 hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                <div className="text-left">
                  <div className="text-sm font-sans font-medium">Génération en cours...</div>
                  <div className="text-xs font-sans text-muted-foreground">GPT Image · High quality</div>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-sans font-medium">Générer via IA</div>
                  <div className="text-xs font-sans text-muted-foreground">GPT Image · High quality</div>
                </div>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
