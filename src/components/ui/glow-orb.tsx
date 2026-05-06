import { cn } from "@/lib/utils";

export function GlowOrb({
  className,
  color = "accent",
}: {
  className?: string;
  color?: "accent" | "foreground";
}) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-[120px] opacity-20 pointer-events-none",
        color === "accent" ? "bg-accent" : "bg-foreground",
        className
      )}
      aria-hidden="true"
    />
  );
}
