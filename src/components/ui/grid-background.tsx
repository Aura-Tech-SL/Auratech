"use client";

import { cn } from "@/lib/utils";

export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-grid opacity-[0.4] pointer-events-none",
        className
      )}
      aria-hidden="true"
    />
  );
}
