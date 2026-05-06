import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LogoGridData } from "@/lib/blocks/schemas";

interface LogoGridBlockProps {
  data: LogoGridData;
}

export function LogoGridBlock({ data }: LogoGridBlockProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        {data.heading && (
          <p className="mb-10 text-center font-mono text-sm uppercase tracking-wider text-muted-foreground">
            {data.heading}
          </p>
        )}

        <div
          className={cn(
            "grid items-center gap-8 sm:gap-12",
            data.logos.length <= 3
              ? "grid-cols-2 sm:grid-cols-3"
              : data.logos.length <= 5
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          )}
        >
          {data.logos.map((logo, index) => {
            const img = (
              <Image
                src={logo.src}
                alt={logo.alt || "Logo"}
                width={160}
                height={60}
                className="mx-auto h-10 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-12"
              />
            );

            if (logo.href) {
              return (
                <a
                  key={index}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  {img}
                </a>
              );
            }

            return (
              <div key={index} className="flex items-center justify-center">
                {img}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
