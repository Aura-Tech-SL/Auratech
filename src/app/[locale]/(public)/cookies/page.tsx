"use client";

import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";

const sections = [
  { titleKey: "cookiesWhat", heading: "What are cookies?" },
  { titleKey: "cookiesTypes", heading: "Types of cookies" },
  { titleKey: "cookiesManage", heading: "Managing cookies" },
  { titleKey: "cookiesThirdParty", heading: "Third-party cookies" },
] as const;

export default function CookiesPage() {
  const t = useTranslations("legal");
  const tFooter = useTranslations("footer");

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
      <SectionLabel className="mb-6">{tFooter("cookies")}</SectionLabel>
      <h1 className="font-light text-4xl sm:text-5xl tracking-tight mb-12">
        {t("cookiesTitle")}
      </h1>

      <div className="space-y-0">
        {sections.map((section) => (
          <div key={section.titleKey} className="border-t border-border py-8">
            <h2 className="text-lg font-medium mb-3">{section.heading}</h2>
            <p className="text-sm text-foreground/60 whitespace-pre-line leading-relaxed">
              {t(section.titleKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
