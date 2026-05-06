import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDesc"),
    alternates: buildLocaleAlternates("/privacitat", params.locale),
  };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
