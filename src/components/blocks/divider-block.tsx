import { cn } from "@/lib/utils";
import type { DividerData } from "@/lib/blocks/schemas";

interface DividerBlockProps {
  data: DividerData;
}

export function DividerBlock({ data }: DividerBlockProps) {
  const style = data.style ?? "solid";

  if (style === "gradient") {
    return (
      <section className="py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <hr
          className={cn(
            "border-t border-border",
            style === "dashed" && "border-dashed"
          )}
        />
      </div>
    </section>
  );
}
