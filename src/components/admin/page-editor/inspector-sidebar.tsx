"use client";

import { useState } from "react";
import { FileText, Settings2 } from "lucide-react";
import { BlockEditorForm } from "@/components/admin/block-editor-form";
import { cn } from "@/lib/utils";

interface InspectorSidebarProps {
  /** Document-level settings — rendered in the document tab. */
  documentTab: React.ReactNode;
  /** Label for the document tab (default "Pàgina"). */
  documentTabLabel?: string;
  /** Block-specific config — rendered in the "Bloc" tab. */
  selectedBlock: {
    type: string;
    data: Record<string, unknown>;
    onChange: (data: Record<string, unknown>) => void;
  } | null;
}

const BLOCK_LABELS: Record<string, string> = {
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

export function InspectorSidebar({
  documentTab,
  documentTabLabel = "Pàgina",
  selectedBlock,
}: InspectorSidebarProps) {
  const [active, setActive] = useState<"page" | "block">(
    selectedBlock ? "block" : "page",
  );

  // Auto-switch to block tab when something is selected.
  const effectiveActive: "page" | "block" =
    selectedBlock && active === "block" ? "block" : !selectedBlock ? "page" : active;

  return (
    <aside className="sticky top-4 flex h-[calc(100vh-2rem)] w-full flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <TabBtn
          active={effectiveActive === "page"}
          onClick={() => setActive("page")}
          icon={<FileText className="h-3.5 w-3.5" />}
          label={documentTabLabel}
        />
        <TabBtn
          active={effectiveActive === "block"}
          onClick={() => selectedBlock && setActive("block")}
          disabled={!selectedBlock}
          icon={<Settings2 className="h-3.5 w-3.5" />}
          label={selectedBlock ? BLOCK_LABELS[selectedBlock.type] ?? selectedBlock.type : "Bloc"}
        />
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {effectiveActive === "page" ? (
          documentTab
        ) : selectedBlock ? (
          <BlockEditorForm
            type={selectedBlock.type}
            data={selectedBlock.data}
            onChange={selectedBlock.onChange}
          />
        ) : (
          <p className="py-8 text-center text-xs text-foreground/40">
            Selecciona un bloc al canvas per editar-ne la configuració
          </p>
        )}
      </div>
    </aside>
  );
}

function TabBtn({
  active,
  onClick,
  disabled,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-mono uppercase tracking-wider transition-colors",
        active
          ? "border-b-2 border-accent bg-accent/[0.04] text-accent"
          : "border-b-2 border-transparent text-foreground/50 hover:text-foreground/80",
        disabled && "cursor-not-allowed opacity-30 hover:text-foreground/50",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
