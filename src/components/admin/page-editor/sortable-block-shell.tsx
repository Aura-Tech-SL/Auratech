"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import { BlockSummary } from "./block-summary";
import { cn } from "@/lib/utils";

interface SortableBlockShellProps {
  id: string;
  type: string;
  data: Record<string, unknown>;
  isVisible: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableBlockShell({
  id,
  type,
  data,
  isVisible,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  onDuplicate,
}: SortableBlockShellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group relative rounded-lg border transition-colors",
        isSelected
          ? "border-accent/40 bg-accent/[0.04]"
          : "border-border bg-card hover:border-border/80",
        isDragging && "opacity-40 shadow-2xl",
      )}
    >
      <div className="flex items-stretch">
        {/* Grip handle (full-height, left edge) */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrossega per reordenar"
          className="flex w-8 shrink-0 cursor-grab items-center justify-center rounded-l-lg border-r border-border/40 bg-secondary/20 text-foreground/30 hover:bg-secondary/40 hover:text-foreground/70 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Body — clickable summary */}
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
        >
          <BlockSummary
            type={type}
            data={data}
            isVisible={isVisible}
            isSelected={isSelected}
          />
        </button>

        {/* Action buttons (visible on hover or when selected) */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 pr-2 transition-opacity",
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
          )}
        >
          <ShellBtn
            title={isVisible ? "Amaga" : "Mostra"}
            onClick={onToggleVisibility}
            icon={isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          />
          <ShellBtn
            title="Duplicar bloc"
            onClick={onDuplicate}
            icon={<Copy className="h-3.5 w-3.5" />}
          />
          <ShellBtn
            title="Esborrar"
            onClick={onDelete}
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
          />
        </div>
      </div>
    </div>
  );
}

function ShellBtn({
  title,
  onClick,
  icon,
  danger,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
        danger
          ? "text-foreground/40 hover:bg-destructive/10 hover:text-destructive"
          : "text-foreground/40 hover:bg-secondary hover:text-foreground/80",
      )}
    >
      {icon}
    </button>
  );
}
