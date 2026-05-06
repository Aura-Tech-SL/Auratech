export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { ServeisClient } from "./serveis-client";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("servicesTitle"),
    description: t("servicesDesc"),
    alternates: buildLocaleAlternates("/serveis", params.locale),
  };
}

export default async function ServeisPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let services = await prisma.service.findMany({
    where: { isActive: true, locale },
    orderBy: { order: "asc" },
  });

  // Fallback to CA if no services for this locale
  if (services.length === 0) {
    services = await prisma.service.findMany({
      where: { isActive: true, locale: "ca" },
      orderBy: { order: "asc" },
    });
  }

  const parsed = services.map((s) => ({
    ...s,
    features: (typeof s.features === "string" ? JSON.parse(s.features) : s.features) as Array<{ title: string; description: string }>,
  }));

  return <ServeisClient services={parsed} />;
}
