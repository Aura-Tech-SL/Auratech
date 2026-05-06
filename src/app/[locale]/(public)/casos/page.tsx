import { getTranslations } from "next-intl/server";
import { CasosClient } from "./casos-client";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("casesTitle"),
    description: t("casesDesc"),
  };
}

export default function CasosPage() {
  return <CasosClient />;
}
