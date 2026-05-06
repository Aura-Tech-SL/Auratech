import { getTranslations } from "next-intl/server";
import { CasosClient } from "./casos-client";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("casesTitle"),
    description: t("casesDesc"),
    alternates: buildLocaleAlternates("/casos", params.locale),
  };
}

export default function CasosPage() {
  return <CasosClient />;
}
