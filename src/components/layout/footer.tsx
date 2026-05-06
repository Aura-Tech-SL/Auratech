"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const t = useTranslations("footer");

  const serviceLinks = [
    { name: t("svc1"), href: "/serveis/iot-retail" },
    { name: t("svc2"), href: "/serveis/cloud-devops" },
    { name: t("svc3"), href: "/serveis/estrategia-digital" },
    { name: t("svc4"), href: "/serveis/desenvolupament" },
  ];

  const companyLinks = [
    { name: t("company"), href: "/sobre" },
    { name: t("services"), href: "/serveis" },
    { name: "Blog", href: "/blog" },
    { name: "Labs", href: "/labs" },
  ];

  const legalLinks = [
    { name: t("legalNotice"), href: "/avis-legal" },
    { name: t("privacy"), href: "/privacitat" },
    { name: t("cookies"), href: "/cookies" },
  ];

  return (
    <footer className="border-t border-border">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-sm text-foreground/40 leading-relaxed max-w-xs">
              {t("description")}
            </p>
            <div className="space-y-2 font-mono text-[12px] text-foreground/30">
              <p>info@auratech.cat</p>
              <p>Vic, Catalunya</p>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/30 mb-6">
              {t("services")}
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/30 mb-6">
              {t("company")}
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Divina Combustion */}
          <div className="lg:col-span-2">
            <a
              href="https://divinacombustion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors duration-200"
            >
              Divina Combustion
              <ArrowUpRight className="h-3 w-3" />
            </a>

            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/30 mb-4 mt-8">
              Social
            </h3>
            <div className="flex gap-4">
              {[
                { name: "LinkedIn", href: "https://linkedin.com" },
                { name: "GitHub", href: "https://github.com" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-foreground/30 hover:text-foreground transition-colors duration-200 flex items-center gap-0.5"
                >
                  {social.name}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/30 mb-6">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border py-6">
          <p className="font-mono text-[11px] text-foreground/30">
            &copy; {new Date().getFullYear()} Auratech. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
