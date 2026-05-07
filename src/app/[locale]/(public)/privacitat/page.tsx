"use client";

import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";

const sections = [
  { headingKey: "privacyHeadingController", bodyKey: "privacyController" },
  { headingKey: "privacyHeadingData", bodyKey: "privacyData" },
  { headingKey: "privacyHeadingBasis", bodyKey: "privacyBasis" },
  { headingKey: "privacyHeadingRetention", bodyKey: "privacyRetention" },
  { headingKey: "privacyHeadingSubprocessors", bodyKey: "privacySubprocessors" },
  { headingKey: "privacyHeadingArticle9", bodyKey: "privacyArticle9" },
  { headingKey: "privacyHeadingTransfers", bodyKey: "privacyTransfers" },
  { headingKey: "privacyHeadingRights", bodyKey: "privacyRights" },
  { headingKey: "privacyHeadingContact", bodyKey: "privacyContact" },
] as const;

export default function PrivacitatPage() {
  const t = useTranslations("legal");
  const tFooter = useTranslations("footer");

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
      <SectionLabel className="mb-6">{tFooter("privacy")}</SectionLabel>
      <h1 className="font-light text-4xl sm:text-5xl tracking-tight mb-12">
        {t("privacyTitle")}
      </h1>

      <div className="space-y-0">
        {sections.map((section) => (
          <div key={section.bodyKey} className="border-t border-border py-8">
            <h2 className="text-lg font-medium mb-3">{t(section.headingKey)}</h2>
            <p className="text-sm text-foreground/60 whitespace-pre-line leading-relaxed">
              {t(section.bodyKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
