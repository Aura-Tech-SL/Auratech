"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Bot, Sparkles, Check, MessageCircle } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { buildWhatsappLink } from "@/lib/whatsapp";

export function HomeAiSpotlight() {
  const t = useTranslations("home");

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden border-t border-border/40">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-accent/[0.06]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                {t("aiBadge")}
              </span>
            </div>

            <h2 className="font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-6">
              {t("aiHeadline")}
            </h2>

            <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
              {t("aiSubheadline")}
            </p>

            <ul className="space-y-3 mb-10">
              {[t("aiBullet1"), t("aiBullet2"), t("aiBullet3")].map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3 text-sm text-foreground/70"
                >
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{bullet}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/automatitzacions-ia"
                data-cta="ai_spotlight_primary"
                data-cta-location="home"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-md font-mono text-xs uppercase tracking-wider hover:bg-foreground/90 transition-colors"
              >
                {t("aiCtaPrimary")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={buildWhatsappLink(
                  "Hola Sandra, m'interessa el pilot d'IA per a la meva clínica."
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                data-cta-location="ai_spotlight"
                className="inline-flex items-center gap-2 border border-border bg-transparent text-foreground px-6 py-3 rounded-md font-mono text-xs uppercase tracking-wider hover:bg-foreground/5 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t("aiCtaSecondary")}
              </a>
            </div>
          </motion.div>

          {/* Right — WhatsApp-style chat mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Phone frame */}
            <div className="relative rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Header bar (WhatsApp-style) */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card">
                <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {t("aiChatHeaderName")}
                  </p>
                  <p className="text-[11px] text-accent flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {t("aiChatHeaderStatus")}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 bg-muted/20 min-h-[420px]">
                {/* Client message 1 */}
                <ChatBubble side="left" delay={0.3}>
                  {t("aiChat1Client")}
                </ChatBubble>
                {/* Agent reply 1 */}
                <ChatBubble side="right" delay={0.7} agent>
                  {t("aiChat1Agent")}
                </ChatBubble>
                {/* Client message 2 */}
                <ChatBubble side="left" delay={1.1}>
                  {t("aiChat2Client")}
                </ChatBubble>
                {/* Agent reply 2 */}
                <ChatBubble side="right" delay={1.5} agent>
                  {t("aiChat2Agent")}
                </ChatBubble>
              </div>
            </div>

            {/* Floating accent badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.8, duration: 0.4 }}
              className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                {t("aiChatBadgeLabel")}
              </p>
              <p className="text-sm font-semibold">{t("aiChatBadgeValue")}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  children,
  side,
  delay,
  agent = false,
}: {
  children: React.ReactNode;
  side: "left" | "right";
  delay: number;
  agent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          side === "right"
            ? agent
              ? "bg-accent text-accent-foreground rounded-br-sm"
              : "bg-foreground text-background rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
