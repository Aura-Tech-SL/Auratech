export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageBlocks } from "@/components/blocks/block-renderer";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import { buildLocaleAlternates, SITE_URL } from "@/lib/seo";

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

  // Fallback OG: if the Page has no ogImage set, generate one dynamically via /api/og
  // using the page's title + description. This guarantees every CMS page has a
  // shareable visual when posted to WhatsApp / LinkedIn / etc.
  let ogImageUrl = page.ogImage;
  if (!ogImageUrl) {
    const ogParams = new URLSearchParams({
      title: page.metaTitle || page.title,
    });
    if (page.metaDescription || page.description) {
      ogParams.set("subtitle", page.metaDescription || page.description || "");
    }
    ogImageUrl = `${SITE_URL}/api/og?${ogParams.toString()}`;
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.description,
    alternates: buildLocaleAlternates(`/${page.slug}`, params.locale),
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || undefined,
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || undefined,
      images: [ogImageUrl],
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

  return (
    <>
      <WebPageJsonLd
        name={page.metaTitle || page.title}
        description={page.metaDescription || page.description || ""}
        url={`${SITE_URL}/${params.locale}/${page.slug}`}
      />
      <PageBlocks blocks={page.blocks} />
    </>
  );
}
