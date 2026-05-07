"use client";

import { useState } from "react";
import {
  Plus,
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
} from "lucide-react";

const BLOCK_TYPES = [
  { type: "hero", label: "Hero", icon: Layout, category: "Estructura" },
  { type: "rich-text", label: "Text enriquit", icon: Type, category: "Contingut" },
  { type: "image", label: "Imatge", icon: ImageIcon, category: "Contingut" },
  { type: "gallery", label: "Galeria", icon: Images, category: "Contingut" },
  { type: "video", label: "Vídeo", icon: Video, category: "Contingut" },
  { type: "code", label: "Codi", icon: Code, category: "Contingut" },
  { type: "cta", label: "CTA", icon: MousePointerClick, category: "Estructura" },
  { type: "features-grid", label: "Features", icon: Grid3X3, category: "Estructura" },
  { type: "testimonial", label: "Testimoni", icon: Quote, category: "Social" },
  { type: "stats", label: "Estadístiques", icon: BarChart3, category: "Estructura" },
  { type: "divider", label: "Divisor", icon: Minus, category: "Estructura" },
  { type: "accordion", label: "Acordió", icon: List, category: "Contingut" },
  { type: "pricing", label: "Preus", icon: CreditCard, category: "Estructura" },
  { type: "team-grid", label: "Equip", icon: Users, category: "Social" },
  { type: "contact-form", label: "Form contacte", icon: Mail, category: "Estructura" },
  { type: "logo-grid", label: "Logos", icon: Grid3X3, category: "Social" },
  { type: "spacer", label: "Espaiador", icon: Space, category: "Estructura" },
];

interface InsertPointProps {
  onInsert: (type: string) => void;
  /** When true the trigger sits inline (between blocks); otherwise it's a full
   *  centred call-to-action used for empty pages. */
  inline?: boolean;
}

export function InsertPoint({ onInsert, inline = true }: InsertPointProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          inline
            ? "group flex h-6 w-full items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
            : "flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-foreground/50 hover:border-accent/40 hover:text-accent transition-colors"
        }
      >
        <span
          className={
            inline
              ? "flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground/60"
              : "flex items-center gap-2 text-sm"
          }
        >
          <Plus className={inline ? "h-3 w-3" : "h-5 w-5"} />
          {inline ? "Inserir bloc" : "Afegir el primer bloc"}
        </span>
      </button>
    );
  }

  const categories = Array.from(new Set(BLOCK_TYPES.map((b) => b.category)));

  return (
    <div
      className={
        inline
          ? "rounded-lg border border-accent/30 bg-card p-3"
          : "rounded-lg border-2 border-dashed border-accent/40 bg-card p-4"
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/50">
          Tria un bloc
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-foreground/40 hover:text-foreground/70"
        >
          Cancel·lar
        </button>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-foreground/30">
              {cat}
            </p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
              {BLOCK_TYPES.filter((b) => b.category === cat).map((b) => (
                <button
                  key={b.type}
                  type="button"
                  onClick={() => {
                    onInsert(b.type);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded border border-border bg-secondary/20 px-2.5 py-1.5 text-left text-xs text-foreground/80 hover:border-accent/40 hover:bg-accent/5 hover:text-accent transition-colors"
                >
                  <b.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
