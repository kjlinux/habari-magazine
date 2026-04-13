import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Share2, Link2, Check } from "lucide-react";

interface SocialShareProps {
  /** Article title for sharing text */
  title: string;
  /** URL to share — defaults to current page URL */
  url?: string;
  /** Short excerpt for sharing context */
  excerpt?: string;
  /** Display variant: "bar" shows inline buttons, "compact" shows a single button with popover */
  variant?: "bar" | "compact";
  /** Additional CSS classes */
  className?: string;
}

/* SVG icons for social networks (lightweight, no external dependency) */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function getShareUrl(platform: string, url: string, title: string, excerpt?: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(excerpt ? `${title} — ${excerpt}` : title);

  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=HabariMag`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    default:
      return "#";
  }
}

function ShareButton({
  platform,
  url,
  title,
  excerpt,
  children,
  label,
  bgClass,
}: {
  platform: string;
  url: string;
  title: string;
  excerpt?: string;
  children: React.ReactNode;
  label: string;
  bgClass: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl(platform, url, title, excerpt);
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-medium transition-all duration-200 hover:scale-105 ${bgClass}`}
      title={`Partager sur ${label}`}
      aria-label={`Partager sur ${label}`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function CopyLinkButton({ url, compact }: { url: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers !");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Impossible de copier le lien.");
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-medium transition-all duration-200 hover:scale-105 bg-muted text-muted-foreground hover:bg-muted/80`}
      title="Copier le lien"
      aria-label="Copier le lien"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      {!compact && <span className="hidden sm:inline">{copied ? "Copié !" : "Copier le lien"}</span>}
    </button>
  );
}

export default function SocialShare({ title, url, excerpt, variant = "bar", className = "" }: SocialShareProps) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  if (variant === "compact") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`font-sans gap-1.5 text-muted-foreground hover:text-primary h-8 px-2 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-xs">Partager</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-sans font-medium text-muted-foreground mb-2.5">Partager cet article</p>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getShareUrl("facebook", shareUrl, title, excerpt), "_blank", "noopener,noreferrer,width=600,height=500");
              }}
              className="w-9 h-9 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors"
              title="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getShareUrl("twitter", shareUrl, title, excerpt), "_blank", "noopener,noreferrer,width=600,height=500");
              }}
              className="w-9 h-9 rounded-lg bg-foreground/5 text-foreground hover:bg-foreground/10 flex items-center justify-center transition-colors"
              title="X (Twitter)"
            >
              <XTwitterIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getShareUrl("linkedin", shareUrl, title, excerpt), "_blank", "noopener,noreferrer,width=600,height=500");
              }}
              className="w-9 h-9 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 flex items-center justify-center transition-colors"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getShareUrl("whatsapp", shareUrl, title, excerpt), "_blank", "noopener,noreferrer,width=600,height=500");
              }}
              className="w-9 h-9 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
            <CopyLinkButton url={shareUrl} compact />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  /* variant === "bar" — full inline share bar */
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-sans font-medium text-muted-foreground mr-1">Partager :</span>
      <ShareButton platform="facebook" url={shareUrl} title={title} excerpt={excerpt} label="Facebook" bgClass="bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20">
        <FacebookIcon className="w-4 h-4" />
      </ShareButton>
      <ShareButton platform="twitter" url={shareUrl} title={title} excerpt={excerpt} label="X" bgClass="bg-foreground/5 text-foreground hover:bg-foreground/10">
        <XTwitterIcon className="w-4 h-4" />
      </ShareButton>
      <ShareButton platform="linkedin" url={shareUrl} title={title} excerpt={excerpt} label="LinkedIn" bgClass="bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20">
        <LinkedInIcon className="w-4 h-4" />
      </ShareButton>
      <ShareButton platform="whatsapp" url={shareUrl} title={title} excerpt={excerpt} label="WhatsApp" bgClass="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20">
        <WhatsAppIcon className="w-4 h-4" />
      </ShareButton>
      <CopyLinkButton url={shareUrl} />
    </div>
  );
}
