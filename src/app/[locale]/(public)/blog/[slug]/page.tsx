export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBlocks } from "@/components/blocks/block-renderer";
import { formatDate } from "@/lib/utils";

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
  });
  if (!post) return {};
  return {
    title: `${post.title} — Auratech Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const t = await getTranslations({ locale: params.locale, namespace: "blog" });
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      blocks: { orderBy: { order: "asc" } },
      author: { select: { name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToBlog")}
          </Button>
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <h1 className="font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-foreground/40 mb-12 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {post.author.name}
          </div>
          {post.publishedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </div>
          )}
          {post.readTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min
            </div>
          )}
        </div>

        {post.coverImage && (
          <div className="aspect-[2/1] rounded-lg overflow-hidden bg-secondary mb-12">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <PageBlocks blocks={post.blocks} />
        </div>
      </div>
    </article>
  );
}
