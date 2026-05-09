"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ArrowUpRight, Lightbulb, Cloud, Code2, Cpu, Bot, BarChart3, Zap, TrendingUp, Layers, Quote } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowOrb } from "@/components/ui/glow-orb";
import { HeroVideo } from "@/components/ui/hero-video";
import { useTranslations } from "next-intl";
import { HomeAiSpotlight } from "@/components/sections/home-ai-spotlight";

const serviceIcons = [Lightbulb, Cloud, Code2, Cpu, BarChart3, Bot];
const stepIcons = [Layers, Zap, TrendingUp];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      {value}{suffix}
    </motion.span>
  );
}

function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.33, 1, 0.68, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function HomePage() {
  const t = useTranslations("home");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const services = [
    { icon: serviceIcons[0], title: t("svc1Title"), description: t("svc1Desc") },
    { icon: serviceIcons[1], title: t("svc2Title"), description: t("svc2Desc") },
    { icon: serviceIcons[2], title: t("svc3Title"), description: t("svc3Desc") },
    { icon: serviceIcons[3], title: t("svc4Title"), description: t("svc4Desc") },
    { icon: serviceIcons[4], title: t("svc5Title"), description: t("svc5Desc") },
    { icon: serviceIcons[5], title: t("svc6Title"), description: t("svc6Desc") },
  ];

  const stats = [
    { value: 50, suffix: "+", label: t("stat1") },
    { value: 30, suffix: "+", label: t("stat2") },
    { value: 99.9, suffix: "%", label: t("stat3") },
    { value: 5, suffix: "+", label: t("stat4") },
  ];

  const processSteps = [
    { num: "01", icon: stepIcons[0], title: t("step1Title"), description: t("step1Desc") },
    { num: "02", icon: stepIcons[1], title: t("step2Title"), description: t("step2Desc") },
    { num: "03", icon: stepIcons[2], title: t("step3Title"), description: t("step3Desc") },
  ];

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video background — replaces the previous mesh + scan line + particle layers */}
        <HeroVideo src="/videos/hero-loop.mp4" poster="/videos/hero-loop-poster.jpg" />

        {/* Layered overlays: keep brand tint + readability while letting motion bleed through */}
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        <GridBackground className="opacity-[0.08]" />
        <GlowOrb className="w-[700px] h-[700px] -top-40 -right-40 opacity-20 mix-blend-screen" />

        {/* Bottom accent line — single subtle pulse, no scan line */}
        <motion.div
          className="absolute left-0 right-0 bottom-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.6), transparent)" }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="mx-auto max-w-7xl px-6 lg:px-8 w-full relative py-20 sm:py-28 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-accent border border-accent/30 bg-accent/5 px-5 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t("badge")}
            </span>
          </motion.div>

          {/* Main hero text */}
          <div className="mb-16 max-w-6xl">
            <h1 className="font-light text-5xl sm:text-7xl lg:text-[6rem] xl:text-[7.5rem] tracking-tighter leading-[0.9]">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
              >
                {t("heroLine1")}
              </motion.span>
              <motion.span
                className="block mt-2"
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
              >
                <span className="bg-gradient-to-r from-accent via-accent/80 to-accent/50 bg-clip-text text-transparent font-normal">
                  {t("heroLine2")}
                </span>
              </motion.span>
            </h1>
          </div>

          {/* Description + CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }} className="max-w-xl">
            <p className="text-base text-foreground/50 leading-relaxed mb-10">{t("heroDescription")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacte" data-cta="hero_primary" data-cta-location="home" className="inline-flex items-center gap-3 font-mono text-xs tracking-wider uppercase bg-accent text-accent-foreground px-8 py-4 rounded-md hover:bg-accent/90 hover:shadow-[0_0_40px_-5px_hsl(var(--accent)/0.5)] group transition-all duration-300">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link href="/serveis" data-cta="hero_secondary" data-cta-location="home" className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-foreground/50 border border-border px-8 py-4 rounded-md hover:border-accent/30 hover:text-foreground/80 transition-all duration-200">
                {t("ctaSecondary")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-foreground/40 mt-1 font-mono tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative border-t border-border py-28 sm:py-36 overflow-hidden">
        <GlowOrb className="w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <SectionLabel className="mb-6">{t("manifestoLabel")}</SectionLabel>
          <div className="max-w-4xl">
            <h2 className="font-light text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.95] mb-16">
              <WordReveal text={t("manifestoTitle")} />
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[t("manifestoP1"), t("manifestoP2"), t("manifestoP3")].map((p, i) => (
                <motion.p
                  key={i}
                  className="text-sm text-foreground/50 leading-relaxed border-t border-border pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative border-t border-border py-24 sm:py-32 overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            <div className="lg:col-span-6">
              <SectionLabel className="mb-4">{t("processLabel")}</SectionLabel>
              <h2 className="font-light text-4xl sm:text-5xl tracking-tight leading-[0.95]">
                {t("processTitle1")}<br />
                <span className="bg-gradient-to-r from-accent to-accent/50 bg-clip-text text-transparent">{t("processTitle2")}</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 flex items-end">
              <p className="text-sm text-foreground/50 leading-relaxed">{t("processDescription")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-0">
            {processSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }} className="group relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 w-full h-px bg-gradient-to-r from-border via-accent/20 to-border translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-mono text-xs text-accent/60 tracking-wider">{step.num}</span>
                    <motion.div className="w-10 h-10 rounded-lg border border-accent/20 bg-accent/5 flex items-center justify-center group-hover:border-accent/40 group-hover:bg-accent/10 transition-all duration-300" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <step.icon className="h-4 w-4 text-accent" />
                    </motion.div>
                  </div>
                  <h3 className="font-medium text-xl mb-3 group-hover:text-accent transition-colors duration-200">{step.title}</h3>
                  <p className="text-sm text-foreground/40 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Spotlight — destacat de la nova línia */}
      <HomeAiSpotlight />

      {/* Services */}
      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
            <div className="lg:col-span-5">
              <SectionLabel className="mb-4">{t("servicesLabel")}</SectionLabel>
              <h2 className="font-light text-4xl sm:text-5xl tracking-tight leading-[0.95]">
                {t("servicesTitle1")}<br /><span className="text-foreground/40">{t("servicesTitle2")}</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-sm text-foreground/50 leading-relaxed">{t("servicesDescription")}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }} className="group surface rounded-lg p-6 sm:p-8 hover:border-accent/20 hover:shadow-[0_0_40px_-15px_hsl(var(--accent)/0.15)] transition-all duration-300">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-10 h-10 rounded-lg border border-accent/20 bg-accent/5 flex items-center justify-center mb-5">
                  <service.icon className="h-5 w-5 text-accent" />
                </motion.div>
                <h3 className="font-medium text-lg mb-2 group-hover:text-accent transition-colors duration-200">{service.title}</h3>
                <p className="text-sm text-foreground/40 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/serveis" className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-foreground/50 hover:text-foreground transition-colors duration-200">
              {t("seeAllServices")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative border-t border-border py-24 sm:py-32 overflow-hidden">
        <GlowOrb className="w-[700px] h-[700px] top-1/2 right-[-20%] -translate-y-1/2 opacity-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            <div className="lg:col-span-5">
              <SectionLabel className="mb-4">{t("clientsLabel")}</SectionLabel>
              <h2 className="font-light text-4xl sm:text-5xl tracking-tight leading-[0.95]">
                {t("clientsTitle1")}<br />
                <span className="text-foreground/40">{t("clientsTitle2")}</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-sm text-foreground/50 leading-relaxed">{t("clientsDescription")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: t("t1Quote"), author: t("t1Author"), role: t("t1Role"), company: t("t1Company") },
              { quote: t("t2Quote"), author: t("t2Author"), role: t("t2Role"), company: t("t2Company") },
              { quote: t("t3Quote"), author: t("t3Author"), role: t("t3Role"), company: t("t3Company") },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="group surface rounded-lg p-8 flex flex-col justify-between hover:border-accent/20 transition-all duration-300"
              >
                <div>
                  <Quote className="h-5 w-5 text-accent/40 mb-4" />
                  <p className="text-sm text-foreground/60 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="font-mono text-[11px] text-foreground/40 tracking-wider mt-0.5">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border py-28 sm:py-36 overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] -bottom-32 left-1/2 -translate-x-1/2 opacity-30" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative text-center">
          <SectionLabel className="mb-6">{t("ctaLabel")}</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-light text-4xl sm:text-6xl lg:text-7xl tracking-tight mb-4"
          >
            {t("ctaTitle1")}<br />
            <span className="bg-gradient-to-r from-accent to-accent/50 bg-clip-text text-transparent">{t("ctaTitle2")}</span>
          </motion.h2>
          <p className="text-sm text-foreground/40 max-w-lg mx-auto mb-10">{t("ctaDescription")}</p>
          <Link href="/contacte" data-cta="footer_cta" data-cta-location="home" className="inline-flex items-center gap-3 font-mono text-xs tracking-wider uppercase bg-accent text-accent-foreground px-10 py-5 rounded-md hover:bg-accent/90 hover:shadow-[0_0_50px_-5px_hsl(var(--accent)/0.5)] transition-all duration-300">
            {t("ctaButton")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
