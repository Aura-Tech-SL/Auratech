"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowOrb } from "@/components/ui/glow-orb";

export function HomeFallback() {
  const t = useTranslations("home");

  return (
    <>
      <section className="relative min-h-[90vh] flex items-end pb-16 sm:pb-20 overflow-hidden">
        <GridBackground />
        <GlowOrb className="w-[600px] h-[600px] -top-40 -right-40" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full relative">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="lg:col-span-8"
            >
              <SectionLabel className="mb-6 block">
                {t("badge")}
              </SectionLabel>
              <h1 className="font-light text-6xl sm:text-8xl lg:text-[6.5rem] tracking-tight leading-[0.88]">
                {t("heroLine1")}
                <br />
                {t("heroLine2")}
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-4 flex flex-col justify-end"
            >
              <div className="border-l border-border pl-6">
                <p className="text-sm text-foreground/50 leading-relaxed mb-6">
                  {t("heroDescription")}
                </p>
                <Link
                  href="/contacte"
                  className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-foreground/60 hover:text-foreground group transition-colors duration-200"
                >
                  {t("ctaPrimary")}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <SectionLabel className="mb-4">CMS</SectionLabel>
          <h2 className="font-light text-3xl tracking-tight text-foreground/60">
            CMS
          </h2>
          <p className="mt-4 text-sm text-foreground/40 max-w-md mx-auto">
            <Link href="/admin/pagines" className="text-accent hover:underline">/admin</Link>
          </p>
        </div>
      </section>
    </>
  );
}
