import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.3em] uppercase text-foreground/40",
        className
      )}
    >
      {children}
    </p>
  );
}
