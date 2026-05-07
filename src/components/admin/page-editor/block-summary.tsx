"use client";

import {
  Layout,
  Type,
  Image as ImageIcon,
  Images,
  Video,
  Code,
  MousePointerClick,
  Grid3X3,
  Quote,
  BarChart3,
  Minus,
  List,
  CreditCard,
  Users,
  Mail,
  Space,
  type LucideIcon,
} from "lucide-react";

const ICON_BY_TYPE: Record<string, LucideIcon> = {
  hero: Layout,
  "rich-text": Type,
  image: ImageIcon,
  gallery: Images,
  video: Video,
  code: Code,
  cta: MousePointerClick,
  "features-grid": Grid3X3,
  testimonial: Quote,
  stats: BarChart3,
  divider: Minus,
  accordion: List,
  pricing: CreditCard,
  "team-grid": Users,
  "contact-form": Mail,
  "logo-grid": Grid3X3,
  spacer: Space,
};

const LABEL_BY_TYPE: Record<string, string> = {
  hero: "Hero",
  "rich-text": "Text enriquit",
  image: "Imatge",
  gallery: "Galeria",
  video: "Vídeo",
  code: "Codi",
  cta: "CTA",
  "features-grid": "Features",
  testimonial: "Testimoni",
  stats: "Stats",
  divider: "Divisor",
  accordion: "Acordió",
  pricing: "Preus",
  "team-grid": "Equip",
  "contact-form": "Form contacte",
  "logo-grid": "Logos",
  spacer: "Espaiador",
};

/**
 * Compute a 1-2 line preview of the block's content. Best-effort per block
 * type — this is the visual hint, not the source of truth.
 */
function previewText(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "hero":
      return [data.eyebrow, data.title].filter(Boolean).join(" · ") as string;
    case "rich-text": {
      const html = (data.content as string) || "";
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return text.slice(0, 140);
    }
    case "image":
      return (data.alt as string) || (data.url as string) || "(imatge sense URL)";
    case "gallery":
      return `${(data.images as unknown[])?.length ?? 0} imatges`;
    case "video":
      return (data.url as string) || "(URL del vídeo)";
    case "cta":
      return [data.heading, data.buttonText].filter(Boolean).join(" → ") as string;
    case "features-grid": {
      const features = (data.features as Array<{ title?: string }>) ?? [];
      return `${features.length} features${
        features[0]?.title ? ` · ${features[0].title}` : ""
      }`;
    }
    case "testimonial":
      return ((data.quote as string) || "").slice(0, 120);
    case "stats": {
      const stats = (data.stats as Array<{ label?: string }>) ?? [];
      return `${stats.length} estadístiques`;
    }
    case "accordion": {
      const items = (data.items as Array<{ question?: string }>) ?? [];
      return `${items.length} preguntes${
        items[0]?.question ? ` · ${items[0].question}` : ""
      }`;
    }
    case "pricing": {
      const plans = (data.plans as Array<{ name?: string }>) ?? [];
      return `${plans.length} plans${plans[0]?.name ? ` · ${plans[0].name}` : ""}`;
    }
    case "team-grid": {
      const members = (data.members as Array<{ name?: string }>) ?? [];
      return `${members.length} membres`;
    }
    case "logo-grid": {
      const logos = (data.logos as Array<unknown>) ?? [];
      return `${logos.length} logos`;
    }
    case "code":
      return (
        ((data.language as string) ? `[${data.language}] ` : "") +
        ((data.code as string) || "").slice(0, 100)
      );
    case "divider":
      return "—";
    case "spacer":
      return `Mida: ${data.size ?? "md"}`;
    case "contact-form":
      return (data.heading as string) || "Formulari de contacte";
    default:
      return JSON.stringify(data).slice(0, 100);
  }
}

interface BlockSummaryProps {
  type: string;
  data: Record<string, unknown>;
  isVisible: boolean;
  isSelected: boolean;
}

export function BlockSummary({
  type,
  data,
  isVisible,
  isSelected,
}: BlockSummaryProps) {
  const Icon = ICON_BY_TYPE[type] ?? Code;
  const label = LABEL_BY_TYPE[type] ?? type;
  const preview = previewText(type, data);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 ${
        !isVisible ? "opacity-50" : ""
      } ${isSelected ? "bg-accent/10" : ""}`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
          isSelected
            ? "border-accent/40 bg-accent/20 text-accent"
            : "border-border bg-secondary/30 text-foreground/60"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm leading-snug truncate ${
            preview ? "text-foreground/85" : "text-foreground/30 italic"
          }`}
        >
          {preview || "(buit)"}
        </p>
      </div>
    </div>
  );
}
