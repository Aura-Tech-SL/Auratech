"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Lightbulb,
  Cloud,
  Code2,
  Cpu,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionLabel } from "@/components/ui/section-label";
import type { LucideIcon } from "lucide-react";

interface ServiceConfig {
  key: string;
  icon: LucideIcon;
  image: string;
  svcNum: number;
}

const serviceConfig: Record<string, ServiceConfig> = {
  "estrategia-digital": {
    key: "strategy",
    icon: Lightbulb,
    image: "/images/service-strategy.jpg",
    svcNum: 1,
  },
  "cloud-devops": {
    key: "cloud",
    icon: Cloud,
    image: "/images/service-cloud-new.jpg",
    svcNum: 2,
  },
  desenvolupament: {
    key: "dev",
    icon: Code2,
    image: "/images/service-dev.jpg",
    svcNum: 3,
  },
  "iot-retail": {
    key: "iot",
    icon: Cpu,
    image: "/images/service-iot-new.jpg",
    svcNum: 4,
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export function ServiceLandingClient({ slug }: { slug: string }) {
  const tLanding = useTranslations("serviceLanding");
  const tServices = useTranslations("services");
  const tHome = useTranslations("home");

  const config = serviceConfig[slug];
  if (!config) return null;

  const { key, icon: Icon, image, svcNum } = config;

  const serviceName = tServices(`svc${svcNum}Name`);
  const headline = tLanding(`${key}.headline`);
  const description = tLanding(`${key}.description`);
  const longDescription = tLanding(`${key}.longDescription`);

  // Build benefits array
  const benefits: string[] = [];
  for (let i = 0; i < 5; i++) {
    try {
      benefits.push(tLanding(`${key}.benefits.${i}`));
    } catch {
      break;
    }
  }

  // Build features array (4 features per service)
  const features = Array.from({ length: 4 }, (_, i) => ({
    title: tServices(`svc${svcNum}f${i + 1}`),
    description: tServices(`svc${svcNum}f${i + 1}d`),
  }));

  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5">
              <Icon className="h-4 w-4 text-foreground/60" />
              <span className="font-mono text-xs tracking-wide text-foreground/60">
                {serviceName}
              </span>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <SectionLabel className="mb-4">{serviceName}</SectionLabel>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-light text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight max-w-4xl mb-6"
          >
            {headline}
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-foreground/50 max-w-2xl"
          >
            {description}
          </motion.p>
        </div>
      </section>

      {/* Image + Long Description */}
      <section className="pb-20 sm:pb-28 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div {...fadeUp}>
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={image}
                  alt={serviceName}
                  width={1024}
                  height={640}
                  className="rounded-xl object-cover w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col justify-center"
            >
              <p className="text-foreground/50 text-base sm:text-lg leading-relaxed mb-8">
                {longDescription}
              </p>

              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-foreground/40 mt-0.5 shrink-0" />
                    <span className="text-foreground/70 text-sm sm:text-base">
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-20 sm:pb-28 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel className="mb-4">
              {tServices("label")}
            </SectionLabel>
            <h2 className="font-light text-2xl sm:text-3xl lg:text-4xl tracking-tight">
              {serviceName}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border p-6 sm:p-8"
              >
                <span className="font-mono text-xs text-foreground/30 mb-4 block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg sm:text-xl font-medium tracking-tight mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground/50 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-28 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-light text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-6">
              {tHome("ctaTitle1")}{" "}
              <span className="text-foreground/50">{tHome("ctaTitle2")}</span>
            </h2>
            <p className="text-foreground/50 text-base sm:text-lg max-w-xl mx-auto mb-10">
              {tHome("ctaDescription")}
            </p>
            <Link
              href="/contacte"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-3.5 font-medium text-sm transition-opacity hover:opacity-90"
            >
              {tHome("ctaButton")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
