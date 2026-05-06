"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Lightbulb, Cloud, Code2, Cpu, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { SectionLabel } from "@/components/ui/section-label";
import { GlowOrb } from "@/components/ui/glow-orb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  features: Array<{ title: string; description: string }>;
  order: number;
}

const icons: LucideIcon[] = [Lightbulb, Cloud, Code2, Cpu];
const slugs = ["estrategia-digital", "cloud-devops", "desenvolupament", "iot-retail"];
const imagePaths = [
  "/images/service-strategy.jpg",
  "/images/service-cloud-new.jpg",
  "/images/service-dev.jpg",
  "/images/service-iot-new.jpg",
];

function ServiceCard({
  service,
  index,
}: {
  service: {
    icon: LucideIcon;
    image: string;
    name: string;
    description: string;
    slug: string;
    features: Array<{ title: string; description: string }>;
  };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const Icon = service.icon;
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className="border-t border-border pt-16"
    >
      <div
        className={`grid lg:grid-cols-2 gap-10 lg:gap-20 items-center ${isReversed ? "lg:[direction:rtl]" : ""}`}
      >
        <div className={isReversed ? "lg:[direction:ltr]" : ""}>
          <div className="relative group overflow-hidden rounded-xl">
            <motion.div style={{ y: imgY }}>
              <Image
                src={service.image}
                alt={service.name}
                width={1024}
                height={640}
                className="w-full h-72 sm:h-96 object-cover scale-110 transition-transform duration-1000 group-hover:scale-[1.15]"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-5 left-5 flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon className="h-5 w-5 text-accent" />
              </motion.div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/70 backdrop-blur-sm bg-background/30 px-3 py-1 rounded-full">
                {String(index + 1).padStart(2, "0")} — {service.name}
              </span>
            </div>
          </div>
        </div>
        <div className={isReversed ? "lg:[direction:ltr]" : ""}>
          <motion.div
            initial={{ opacity: 0, x: isReversed ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-4">
              {service.name}
            </h2>
            <p className="text-sm text-foreground/50 leading-relaxed mb-6">
              {service.description}
            </p>
            {service.slug && (
              <Link
                href={`/serveis/${service.slug}`}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase text-accent hover:text-accent/80 transition-colors mb-10"
              >
                Veure m&eacute;s <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            <div className="divide-y divide-border">
              {service.features.map((feature, fi) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + fi * 0.08, duration: 0.4 }}
                  className="py-5 group/feat cursor-default"
                >
                  <h3 className="text-sm font-medium mb-1 group-hover/feat:text-accent transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-foreground/40 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function FaqSection() {
  const t = useTranslations("faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <SectionLabel className="mb-6">{t("title")}</SectionLabel>
        <h2 className="font-light text-3xl sm:text-4xl tracking-tight mb-12">
          {t("title")}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-sm hover:no-underline hover:text-accent">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/60 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function ServeisClient({ services: dbServices }: { services: ServiceData[] }) {
  const t = useTranslations("services");

  // Build service cards from translations (matching Lovable design exactly)
  // DB services are available as fallback but we use translation keys for visual parity
  const services = [
    {
      icon: icons[0],
      image: imagePaths[0],
      name: t("svc1Name"),
      description: t("svc1Desc"),
      slug: slugs[0],
      features: [
        { title: t("svc1f1"), description: t("svc1f1d") },
        { title: t("svc1f2"), description: t("svc1f2d") },
        { title: t("svc1f3"), description: t("svc1f3d") },
        { title: t("svc1f4"), description: t("svc1f4d") },
      ],
    },
    {
      icon: icons[1],
      image: imagePaths[1],
      name: t("svc2Name"),
      description: t("svc2Desc"),
      slug: slugs[1],
      features: [
        { title: t("svc2f1"), description: t("svc2f1d") },
        { title: t("svc2f2"), description: t("svc2f2d") },
        { title: t("svc2f3"), description: t("svc2f3d") },
        { title: t("svc2f4"), description: t("svc2f4d") },
      ],
    },
    {
      icon: icons[2],
      image: imagePaths[2],
      name: t("svc3Name"),
      description: t("svc3Desc"),
      slug: slugs[2],
      features: [
        { title: t("svc3f1"), description: t("svc3f1d") },
        { title: t("svc3f2"), description: t("svc3f2d") },
        { title: t("svc3f3"), description: t("svc3f3d") },
        { title: t("svc3f4"), description: t("svc3f4d") },
      ],
    },
    {
      icon: icons[3],
      image: imagePaths[3],
      name: t("svc4Name"),
      description: t("svc4Desc"),
      slug: slugs[3],
      features: [
        { title: t("svc4f1"), description: t("svc4f1d") },
        { title: t("svc4f2"), description: t("svc4f2d") },
        { title: t("svc4f3"), description: t("svc4f3d") },
        { title: t("svc4f4"), description: t("svc4f4d") },
      ],
    },
  ];

  return (
    <>
      {/* Hero section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] -top-40 -right-40 opacity-30" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel className="mb-6">{t("label")}</SectionLabel>
            <h1 className="font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.95]">
              {t("title")}{" "}
              <span className="italic text-foreground/30">{t("subtitle")}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Service cards section */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-28">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </section>

      {/* FAQ section */}
      <FaqSection />
    </>
  );
}
