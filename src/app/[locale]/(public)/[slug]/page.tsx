export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageBlocks } from "@/components/blocks/block-renderer";

interface Props {
  params: { slug: string; locale: string };
}

// Reserved slugs that have their own route files
const RESERVED_SLUGS = ["serveis", "projectes", "blog", "contacte", "sobre", "labs", "casos", "avis-legal", "privacitat", "cookies", "login", "registre"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (RESERVED_SLUGS.includes(params.slug)) return {};

  const page = await prisma.page.findFirst({
    where: { slug: params.slug, status: "PUBLISHED", locale: params.locale },
  }) || await prisma.page.findFirst({
    where: { slug: params.slug, status: "PUBLISHED", locale: "ca" },
  });

  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.description,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

export default async function DynamicPage({ params }: Props) {
  if (RESERVED_SLUGS.includes(params.slug)) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { slug: params.slug, status: "PUBLISHED", locale: params.locale },
    include: { blocks: { orderBy: { order: "asc" } } },
  }) || await prisma.page.findFirst({
    where: { slug: params.slug, status: "PUBLISHED", locale: "ca" },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!page) {
    notFound();
  }

  return <PageBlocks blocks={page.blocks} />;
}
