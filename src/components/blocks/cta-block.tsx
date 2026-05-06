"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GlowOrb } from "@/components/ui/glow-orb";
import type { CtaData } from "@/lib/blocks/schemas";

interface CtaBlockProps {
  data: CtaData;
}

export function CtaBlock({ data }: CtaBlockProps) {
  return (
    <section className="relative border-t border-border py-24 sm:py-32 overflow-hidden">
      <GlowOrb className="bottom-[-20%] left-1/2 -translate-x-1/2 h-[300px] w-[400px] opacity-10" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
            {data.heading}
          </h2>

          {data.text && (
            <p className="text-foreground/50 text-center max-w-xl mx-auto mt-6 text-lg">
              {data.text}
            </p>
          )}

          <div className="mt-10">
            <Link
              href={data.buttonLink}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-md px-8",
                "bg-accent text-accent-foreground font-medium text-sm uppercase tracking-wide",
                "transition-all duration-300 hover:bg-accent/90",
                "shadow-[0_0_20px_hsl(195_90%_55%/0.3)] hover:shadow-[0_0_30px_hsl(195_90%_55%/0.5)]"
              )}
            >
              {data.buttonText}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
