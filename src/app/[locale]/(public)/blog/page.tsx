export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { BlogClient } from "./blog-client";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return {
    title: t("blogTitle"),
    description: t("blogDesc"),
    alternates: buildLocaleAlternates("/blog", params.locale),
  };
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", locale },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  // Fallback to CA if no posts for this locale
  if (posts.length === 0) {
    posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", locale: "ca" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  }

  return <BlogClient posts={posts} />;
}
