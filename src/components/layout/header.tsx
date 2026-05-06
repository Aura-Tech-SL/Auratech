"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSelector } from "@/components/layout/language-selector";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navigation = [
    { name: t("services"), href: "/serveis" },
    { name: t("ai"), href: "/automatitzacions-ia", highlight: true },
    { name: t("projects"), href: "/projectes" },
    { name: t("cases"), href: "/casos" },
    { name: t("labs"), href: "/labs" },
    { name: t("about"), href: "/sobre" },
    { name: t("blog"), href: "/blog" },
    { name: t("contact"), href: "/contacte" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-7">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative font-mono text-[11px] tracking-wider uppercase transition-colors duration-200",
                  item.highlight
                    ? pathname === item.href
                      ? "text-accent"
                      : "text-accent/80 hover:text-accent"
                    : pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/40 hover:text-foreground/80"
                )}
              >
                {item.name}
                {item.highlight && (
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA + Language + Mobile menu button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <Link
              href="/contacte"
              className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase bg-foreground text-background px-5 py-2 rounded-md hover:bg-foreground/90 transition-colors duration-200"
            >
              {t("cta")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              className="lg:hidden p-2 text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-6 space-y-1 border-t border-border">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 py-3 font-mono text-[13px] tracking-wider uppercase transition-colors",
                      item.highlight
                        ? pathname === item.href
                          ? "text-accent"
                          : "text-accent/80"
                        : pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/40"
                    )}
                  >
                    {item.name}
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  <div className="py-3">
                    <LanguageSelector />
                  </div>
                  <Link
                    href="/contacte"
                    className="flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-md font-mono text-[13px] tracking-wider uppercase"
                  >
                    {t("cta")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
