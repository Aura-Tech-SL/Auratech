import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      {/* Geometric "A" mark */}
      <path
        d="M16 2L4 28h4.5L16 10l7.5 18H28L16 2z"
        fill="currentColor"
      />
      <rect
        x="9"
        y="20"
        width="14"
        height="2.5"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark
        className={cn(
          variant === "light" ? "text-primary-foreground" : "text-foreground"
        )}
      />
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn(
            "font-medium text-lg tracking-tight",
            variant === "light" ? "text-primary-foreground" : "text-foreground"
          )}
        >
          Aura
        </span>
        <span
          className={cn(
            "font-mono text-[11px] tracking-[0.2em] uppercase",
            variant === "light"
              ? "text-primary-foreground/60"
              : "text-foreground/50"
          )}
        >
          tech
        </span>
      </div>
    </div>
  );
}

export { LogoMark };
