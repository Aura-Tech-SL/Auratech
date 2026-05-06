"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, Quote, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionLabel } from "@/components/ui/section-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowOrb } from "@/components/ui/glow-orb";

const casesData = [
  { key: "c1", image: "/images/case-esl.jpg", tags: ["ESL", "IoT", "React", "Analytics"] },
  { key: "c2", image: "/images/case-cloud.jpg", tags: ["AWS", "Terraform", "Grafana", "Microservices"] },
  { key: "c3", image: "/images/case-iot.jpg", tags: ["IoT", "React Native", "AI", "Maps API"] },
  { key: "c4", image: "/images/case-resol.jpg", tags: ["React", "Node.js", "Middleware", "ERP"] },
  { key: "c5", image: "/images/case-iot.jpg", tags: ["WhatsApp", "AI Agent", "n8n", "Google Calendar"] },
];

function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="text-center"
    >
      <div className="text-3xl sm:text-4xl font-light text-accent tracking-tight mb-1">
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-wider uppercase text-foreground/40">
        {label}
      </div>
    </motion.div>
  );
}

function CaseCard({
  caseKey,
  index,
  image,
  tags,
}: {
  caseKey: string;
  index: number;
  image: string;
  tags: string[];
}) {
  const t = useTranslations("cases");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const isReversed = index % 2 === 1;

  const stats = [
    { value: t(`${caseKey}Stat1`), label: t(`${caseKey}Stat1Label`) },
    { value: t(`${caseKey}Stat2`), label: t(`${caseKey}Stat2Label`) },
    { value: t(`${caseKey}Stat3`), label: t(`${caseKey}Stat3Label`) },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="py-16 sm:py-24 border-t border-border/20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-[11px] text-foreground/25 tracking-wider">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/30 text-accent bg-accent/10"
          >
            {t(`${caseKey}Sector`)}
          </Badge>
          <span className="font-mono text-[11px] text-foreground/30">
            {t(`${caseKey}Client`)}
          </span>
        </div>

        <motion.h2
          className="font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 max-w-3xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t(`${caseKey}Title`)}
        </motion.h2>

        <p className="text-foreground/40 text-sm leading-relaxed max-w-2xl mb-10">
          {t(`${caseKey}Desc`)}
        </p>

        {/* Image + Content Grid */}
        <div
          className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-12 ${
            isReversed ? "lg:grid-flow-dense" : ""
          }`}
        >
          {/* Image */}
          <div
            className={`relative rounded-lg overflow-hidden aspect-[16/10] ${
              isReversed ? "lg:col-start-2" : ""
            }`}
          >
            <motion.div
              className="w-full h-full"
              style={{ scale: imgScale }}
            >
              <Image
                src={image}
                alt={t(`${caseKey}Title`)}
                width={1024}
                height={640}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-wider text-foreground/50 bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Challenge + Solution */}
          <div className="space-y-8">
            <div>
              <SectionLabel className="mb-3 text-[10px]">
                {t("challenge")}
              </SectionLabel>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t(`${caseKey}Challenge`)}
              </p>
            </div>
            <div>
              <SectionLabel className="mb-3 text-[10px]">
                {t("solution")}
              </SectionLabel>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t(`${caseKey}Solution`)}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="surface rounded-xl p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-accent">
              {t("results")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <StatCard
                key={i}
                value={stat.value}
                label={stat.label}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <motion.blockquote
          className="mt-10 relative pl-8 border-l-2 border-accent/20 max-w-2xl"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Quote className="absolute -left-3 -top-1 h-5 w-5 text-accent/30 bg-background" />
          <p className="text-sm text-foreground/60 leading-relaxed italic mb-3">
            &ldquo;{t(`${caseKey}Quote`)}&rdquo;
          </p>
          <footer className="font-mono text-[11px] text-foreground/40">
            <span className="text-foreground/60">
              {t(`${caseKey}QuoteAuthor`)}
            </span>{" "}
            &mdash; {t(`${caseKey}QuoteRole`)}
          </footer>
        </motion.blockquote>
      </div>
    </motion.section>
  );
}

export function CasosClient() {
  const t = useTranslations("cases");

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] -top-32 -right-20 opacity-15" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel className="mb-6">{t("label")}</SectionLabel>
            <h1 className="font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.95]">
              {t("title")}
              <br />
              <span className="italic text-foreground/30">{t("subtitle")}</span>
            </h1>
            <p className="mt-6 text-foreground/40 text-sm leading-relaxed max-w-xl">
              {t("description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      {casesData.map((c, i) => (
        <CaseCard
          key={c.key}
          caseKey={c.key}
          index={i}
          image={c.image}
          tags={c.tags}
        />
      ))}

      {/* CTA */}
      <section className="border-t border-border/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel className="mb-6 justify-center">
              Auratech
            </SectionLabel>
            <h2 className="font-light text-3xl sm:text-4xl tracking-tight mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-foreground/40 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              {t("ctaDescription")}
            </p>
            <Link href="/contacte">
              <Button
                variant="outline"
                className="font-mono text-xs tracking-wider uppercase border-accent/30 text-accent hover:bg-accent/10 px-8 py-3"
              >
                {t("ctaButton")}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
