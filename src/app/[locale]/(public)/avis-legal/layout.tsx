import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("legalTitle"),
    description: t("legalDesc"),
    alternates: buildLocaleAlternates("/avis-legal", params.locale),
  };
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
