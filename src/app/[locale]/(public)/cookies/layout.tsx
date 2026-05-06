import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("cookiesTitle"),
    description: t("cookiesDesc"),
    alternates: buildLocaleAlternates("/cookies", params.locale),
  };
}

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
