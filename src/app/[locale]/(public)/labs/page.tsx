"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { GridBackground } from "@/components/ui/grid-background";
import { Badge } from "@/components/ui/badge";

const experimentMeta = [
  { id: "exp1", status: "active" as const, tags: ["LLM", "NLP", "Python", "FastAPI"], date: "2026-01" },
  { id: "exp2", status: "active" as const, tags: ["TensorFlow Lite", "Edge Computing", "Python"], date: "2025-11" },
  { id: "exp3", status: "completed" as const, tags: ["AWS", "GCP", "Azure", "Cost Explorer"], date: "2025-09" },
  { id: "exp4", status: "concept" as const, tags: ["Medusa", "Next.js", "Stripe"], date: "2026-02" },
  { id: "exp5", status: "active" as const, tags: ["BLE", "Mesh", "nRF52", "MQTT"], date: "2025-12" },
  { id: "exp6", status: "completed" as const, tags: ["SAST", "DAST", "CI/CD", "Security"], date: "2025-07" },
];

export default function LabsPage() {
  const t = useTranslations("labs");

  const statusConfig = {
    active: { label: t("active"), className: "border-accent/30 bg-accent/10 text-accent" },
    completed: { label: t("completed"), className: "border-green-500/30 bg-green-500/10 text-green-400" },
    concept: { label: t("concept"), className: "border-foreground/20 bg-foreground/5 text-foreground/60" },
  };

  const experiments = experimentMeta.map((exp) => ({
    ...exp,
    title: t(`${exp.id}Title`),
    description: t(`${exp.id}Desc`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <GridBackground />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel className="mb-6">{t("label")}</SectionLabel>
            <h1 className="font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.95]">
              {t("title")}
              <br />
              <span className="text-foreground/40">{t("subtitle")}</span>
            </h1>
            <p className="mt-8 text-foreground/50 max-w-xl leading-relaxed text-sm">
              {t("description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-4">
            {experiments.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group surface rounded-lg p-6 sm:p-8 hover:border-foreground/15 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <Badge className={statusConfig[exp.status].className}>
                    {statusConfig[exp.status].label}
                  </Badge>
                  <span className="font-mono text-[11px] text-foreground/20">
                    {exp.date}
                  </span>
                </div>
                <h3 className="font-medium text-lg mb-2 group-hover:text-accent transition-colors duration-200">
                  {exp.title}
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed mb-5">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-wider text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <SectionLabel className="mb-4">{t("philosophyLabel")}</SectionLabel>
              <h2 className="font-light text-3xl sm:text-4xl tracking-tight">
                {t("philosophyTitle")}
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-foreground/50 text-sm leading-relaxed space-y-4"
            >
              <p>
                {t("philosophyP1")}
              </p>
              <p>
                {t("philosophyP2")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
