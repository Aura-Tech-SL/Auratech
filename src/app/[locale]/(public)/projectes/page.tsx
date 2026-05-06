export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { ProjectesClient } from "./projectes-client";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("projectsTitle"),
    description: t("projectsDesc"),
    alternates: buildLocaleAlternates("/projectes", params.locale),
  };
}

export default async function ProjectesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let projects = await prisma.project.findMany({
    where: { isActive: true, locale },
    orderBy: { order: "asc" },
  });

  if (projects.length === 0) {
    projects = await prisma.project.findMany({
      where: { isActive: true, locale: "ca" },
      orderBy: { order: "asc" },
    });
  }

  return <ProjectesClient projects={projects} />;
}
