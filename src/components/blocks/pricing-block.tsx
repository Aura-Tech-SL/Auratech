import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingData } from "@/lib/blocks/schemas";

interface PricingBlockProps {
  data: PricingData;
}

export function PricingBlock({ data }: PricingBlockProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {data.heading && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.heading}
          </h2>
        )}

        <div
          className={cn(
            "grid gap-6 sm:gap-8",
            data.tiers.length <= 2
              ? "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {data.tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                tier.highlighted
                  ? "border-accent/50 bg-accent/5 shadow-[0_0_30px_hsl(195_90%_55%/0.1)]"
                  : "border-border bg-card"
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 font-mono text-xs uppercase tracking-wider text-accent-foreground">
                  {data.recommendedLabel || "Recomanat"}
                </span>
              )}

              <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                {tier.name}
              </h3>

              {tier.price && tier.price !== "—" ? (
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price}&euro;
                  </span>
                  {tier.period && (
                    <span className="text-muted-foreground">/{tier.period}</span>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-base text-foreground/70">
                  {tier.period || "Pressupost personalitzat"}
                </div>
              )}

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={tier.ctaLink || "#"}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-md text-sm font-medium uppercase tracking-wide",
                    "transition-all duration-200",
                    tier.highlighted
                      ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_hsl(195_90%_55%/0.3)]"
                      : "border border-border bg-transparent text-foreground hover:bg-foreground/5"
                  )}
                >
                  {tier.ctaText || "Comença"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
