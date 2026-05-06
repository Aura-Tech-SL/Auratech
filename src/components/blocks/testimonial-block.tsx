import { cn } from "@/lib/utils";
import type { TestimonialData } from "@/lib/blocks/schemas";

interface TestimonialBlockProps {
  data: TestimonialData;
}

export function TestimonialBlock({ data }: TestimonialBlockProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-12">
          <span
            className="absolute -top-5 left-8 text-6xl font-bold leading-none text-accent/30"
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <blockquote className="relative z-10">
            <p className="text-lg leading-relaxed text-foreground sm:text-xl">
              {data.quote}
            </p>
          </blockquote>

          <div className="mt-8 flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                "bg-accent/10 font-semibold text-accent"
              )}
            >
              {data.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{data.author}</p>
              {(data.role || data.company) && (
                <p className="font-mono text-sm text-muted-foreground">
                  {[data.role, data.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          <span
            className="absolute -bottom-5 right-8 text-6xl font-bold leading-none text-accent/30"
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </div>
      </div>
    </section>
  );
}
