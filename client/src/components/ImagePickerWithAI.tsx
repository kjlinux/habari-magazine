import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, Loader2, RefreshCw, Check } from "lucide-react";
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

type AIState = "idle" | "generating" | "preview";

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
  const [aiState, setAiState] = useState<AIState>("idle");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

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

  const openAIPanel = () => {
    setPrompt(aiPromptContext);
    setPreviewUrl("");
    setAiState("idle");
    setShowAIPanel(true);
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setAiState("generating");
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, folder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Erreur ${res.status}`);
      }
      const { url } = await res.json();
      setPreviewUrl(url);
      setAiState("preview");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la génération");
      setAiState("idle");
    }
  };

  const useGeneratedImage = () => {
    onChange(previewUrl);
    setShowAIPanel(false);
    setAiState("idle");
    toast.success("Image IA appliquée");
  };

  const cancelAI = () => {
    setShowAIPanel(false);
    setAiState("idle");
    setPreviewUrl("");
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

      {value && !showAIPanel ? (
        <div className="relative rounded-lg overflow-hidden border border-border group">
          <img src={value} alt="Aperçu" className={`w-full ${previewHeight} object-cover`} onError={(e) => (e.currentTarget.style.display = "none")} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="font-sans text-xs">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
              Remplacer
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={openAIPanel} className="font-sans text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Générer IA
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")} className="font-sans text-xs">
              <X className="w-3 h-3 mr-1" /> Supprimer
            </Button>
          </div>
        </div>
      ) : !showAIPanel ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Uploader une image"
            className="flex-1 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-sm font-sans">Uploader une image</span>
                <span className="text-xs font-sans">JPG, PNG, WebP — max 50 Mo</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={openAIPanel}
            title="Générer avec l'IA"
            className="flex-1 h-32 rounded-lg border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2 text-primary/70 hover:text-primary"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-sans font-medium">Générer avec l'IA</span>
            <span className="text-xs font-sans text-muted-foreground">DALL-E 3</span>
          </button>
        </div>
      ) : null}

      {showAIPanel && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-sans font-semibold text-foreground">Génération IA</span>
          </div>

          <div>
            <label className="block text-xs font-sans text-muted-foreground mb-1">Prompt (modifiable)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={aiState === "generating"}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-sans bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Décrivez l'image souhaitée..."
            />
          </div>

          {aiState === "preview" && previewUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={previewUrl} alt="Image générée" className={`w-full ${previewHeight} object-cover`} />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {aiState === "idle" && (
              <Button type="button" size="sm" onClick={generateImage} disabled={!prompt.trim()} className="font-sans bg-primary hover:bg-primary/90">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Générer
              </Button>
            )}
            {aiState === "generating" && (
              <Button type="button" size="sm" disabled className="font-sans">
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Génération en cours...
              </Button>
            )}
            {aiState === "preview" && (
              <>
                <Button type="button" size="sm" onClick={useGeneratedImage} className="font-sans bg-green-600 hover:bg-green-700">
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Utiliser cette image
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={generateImage} className="font-sans">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Regénérer
                </Button>
              </>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={cancelAI} disabled={aiState === "generating"} className="font-sans text-muted-foreground">
              <X className="w-3.5 h-3.5 mr-1" />
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
