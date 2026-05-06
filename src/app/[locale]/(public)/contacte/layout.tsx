import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("contactTitle"),
    description: t("contactDesc"),
    alternates: buildLocaleAlternates("/contacte", params.locale),
  };
}

export default function ContacteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
