"use client";

import { X } from "lucide-react";
import { BlockEditorForm } from "@/components/admin/block-editor-form";
import { Button } from "@/components/ui/button";

interface SidePanelProps {
  blockType: string;
  blockData: Record<string, unknown>;
  isVisible: boolean;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  "rich-text": "Text enriquit",
  image: "Imatge",
  gallery: "Galeria",
  video: "Vídeo",
  code: "Codi",
  cta: "CTA",
  "features-grid": "Features",
  testimonial: "Testimoni",
  stats: "Estadístiques",
  divider: "Divisor",
  accordion: "Acordió",
  pricing: "Preus",
  "team-grid": "Equip",
  "contact-form": "Form contacte",
  "logo-grid": "Logos",
  spacer: "Espaiador",
};

export function SidePanel({
  blockType,
  blockData,
  isVisible,
  onChange,
  onClose,
}: SidePanelProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-screen w-full max-w-md border-l border-border bg-background shadow-2xl transition-transform ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              Editar bloc
            </p>
            <h2 className="text-lg font-light tracking-tight">
              {TYPE_LABELS[blockType] ?? blockType}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tancar panell"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <BlockEditorForm
            type={blockType}
            data={blockData}
            onChange={onChange}
          />
        </div>

        <footer className="border-t border-border px-5 py-3 text-xs text-foreground/40">
          Els canvis es guarden quan cliques <strong>Desar esborrany</strong> o
          <strong> Publicar</strong> al header de la pàgina.
        </footer>
      </div>
    </aside>
  );
}
