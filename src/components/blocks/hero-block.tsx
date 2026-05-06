"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowOrb } from "@/components/ui/glow-orb";
import type { HeroData } from "@/lib/blocks/schemas";

interface HeroBlockProps {
  data: HeroData;
}

export function HeroBlock({ data }: HeroBlockProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {data.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        />
      )}

      <GridBackground />

      <GlowOrb className="top-[-10%] right-[-5%] h-[400px] w-[500px] opacity-20" />
      <GlowOrb className="bottom-[-10%] left-[-5%] h-[350px] w-[450px] opacity-30" />

      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-light text-6xl sm:text-7xl lg:text-[6rem] tracking-tight leading-[0.9] text-foreground"
        >
          {data.heading}
        </motion.h1>

        {data.subheading && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-lg text-foreground/50 max-w-2xl mx-auto mt-6"
          >
            {data.subheading}
          </motion.p>
        )}

        {(data.ctaText || data.secondaryCtaText) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {data.ctaText && data.ctaLink && (
              <Link
                href={data.ctaLink}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-md px-8",
                  "bg-accent text-accent-foreground font-medium text-sm uppercase tracking-wide",
                  "transition-all duration-300 hover:bg-accent/90",
                  "shadow-[0_0_20px_hsl(195_90%_55%/0.3)] hover:shadow-[0_0_30px_hsl(195_90%_55%/0.5)]"
                )}
              >
                {data.ctaText}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            {data.secondaryCtaText && data.secondaryCtaLink && (
              <Link
                href={data.secondaryCtaLink}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-md px-8",
                  "border border-border bg-transparent text-foreground font-medium text-sm uppercase tracking-wide",
                  "transition-all duration-300 hover:bg-foreground/5 hover:border-foreground/20"
                )}
              >
                {data.secondaryCtaText}
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
