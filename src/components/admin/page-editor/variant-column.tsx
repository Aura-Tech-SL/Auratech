"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { VisualCanvas, type CanvasBlock } from "./visual-canvas";
import type { BlockData } from "./use-variant-state";

interface VariantColumnProps {
  /** Locale code shown as the eyebrow label (e.g. "ca"). */
  localeLabel: string;
  /** Editable title for this variant. */
  title: string;
  onTitleChange: (next: string) => void;
  /** Sub-label rendered under the title (typically the public URL). */
  pathHint: string;
  /** Read-only banner above the canvas (e.g. status badge). */
  statusBadge?: React.ReactNode;
  blocks: BlockData[];
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
  onChange: (clientId: string, data: Record<string, unknown>) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onToggleVisibility: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onDuplicate: (clientId: string) => void;
  onInsert: (type: string, atIndex: number) => void;
  /** When set, shows a "Copia from {label}" CTA on the empty state, used in
   *  the compare column to bootstrap a translation. */
  onCopyFromOther?: () => void;
  copyFromLabel?: string;
}

export function VariantColumn({
  localeLabel,
  title,
  onTitleChange,
  pathHint,
  statusBadge,
  blocks,
  selectedClientId,
  onSelect,
  onChange,
  onReorder,
  onToggleVisibility,
  onDelete,
  onDuplicate,
  onInsert,
  onCopyFromOther,
  copyFromLabel,
}: VariantColumnProps) {
  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            {localeLabel}
          </p>
          {statusBadge}
        </div>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Sense títol"
          className="!text-2xl !h-auto !py-2 !px-2 !font-light !tracking-tight border-transparent hover:border-border focus:border-accent/50 transition-colors bg-transparent"
        />
        <p className="text-xs text-foreground/40 font-mono pl-2">{pathHint}</p>
      </div>

      {blocks.length === 0 && onCopyFromOther && copyFromLabel ? (
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
          <p className="text-sm text-foreground/60 mb-3">
            Aquesta variant està buida.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyFromOther}
            className="gap-2"
          >
            <Copy className="h-3.5 w-3.5" />
            Copia els blocs de {copyFromLabel.toUpperCase()}
          </Button>
          <p className="mt-3 text-xs text-foreground/30">
            (després ho tradueixes inline al canvas)
          </p>
        </div>
      ) : (
        <VisualCanvas
          blocks={blocks as CanvasBlock[]}
          selectedClientId={selectedClientId}
          onSelect={onSelect}
          onChange={onChange}
          onReorder={onReorder}
          onToggleVisibility={onToggleVisibility}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onInsert={onInsert}
        />
      )}
    </div>
  );
}
