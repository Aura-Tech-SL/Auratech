import { getTranslations } from "next-intl/server";
import { SobreFallback } from "@/components/sections/sobre-fallback";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDesc"),
  };
}

export default function Page() {
  return <SobreFallback />;
}
