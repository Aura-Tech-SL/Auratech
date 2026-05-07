export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, PenSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LocalePills, type LocaleVariant } from "@/components/admin/locale-pills";

interface BlogPageProps {
  searchParams: { status?: string; category?: string };
}

interface PostGroup {
  /** translationKey if set, otherwise the slug — guarantees a stable group key. */
  groupKey: string;
  /** Display label: same as groupKey but shown to the editor as a slug-style ref. */
  displayKey: string;
  category: string;
  variants: Array<
    LocaleVariant & {
      title: string;
      slug: string;
      blockCount: number;
      authorName: string;
    }
  >;
  lastUpdated: Date;
  totalBlocks: number;
}

const categoryLabels: Record<string, string> = {
  IOT: "IoT",
  CLOUD: "Cloud",
  STRATEGY: "Estrategia",
  GENERAL: "General",
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const statusFilter = searchParams.status || undefined;
  const categoryFilter = searchParams.category || undefined;

  const allRows = await prisma.blogPost.findMany({
    where: categoryFilter ? { category: categoryFilter as never } : undefined,
    orderBy: [{ slug: "asc" }, { locale: "asc" }],
    include: {
      author: { select: { name: true } },
      _count: { select: { blocks: true } },
    },
  });

  // Group by translationKey when set; fall back to slug for legacy CA-only
  // posts that pre-date the translation linkage. Slugs are locale-specific
  // for SEO, so they can't group multilingual variants on their own.
  const groupsMap = new Map<string, PostGroup>();
  for (const row of allRows) {
    const groupKey = row.translationKey ?? `__slug__:${row.slug}`;
    const displayKey = row.translationKey ?? row.slug;
    const g = groupsMap.get(groupKey) ?? {
      groupKey,
      displayKey,
      category: row.category,
      variants: [],
      lastUpdated: row.updatedAt,
      totalBlocks: 0,
    };
    g.variants.push({
      id: row.id,
      locale: row.locale,
      status: row.status,
      updatedAt: row.updatedAt,
      title: row.title,
      slug: row.slug,
      blockCount: row._count.blocks,
      authorName: row.author.name,
    });
    if (row.updatedAt > g.lastUpdated) g.lastUpdated = row.updatedAt;
    g.totalBlocks = Math.max(g.totalBlocks, row._count.blocks);
    groupsMap.set(groupKey, g);
  }

  let groups = Array.from(groupsMap.values()).sort(
    (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
  );

  if (statusFilter) {
    groups = groups.filter((g) =>
      g.variants.some((v) => v.status === statusFilter),
    );
  }

  const counts = {
    total: groupsMap.size,
    drafts: Array.from(groupsMap.values()).filter((g) =>
      g.variants.some((v) => v.status === "DRAFT"),
    ).length,
    published: Array.from(groupsMap.values()).filter((g) =>
      g.variants.some((v) => v.status === "PUBLISHED"),
    ).length,
  };

  const statusFilters = [
    { label: "Tots", value: undefined, count: counts.total },
    { label: "Esborranys", value: "DRAFT", count: counts.drafts },
    { label: "Publicats", value: "PUBLISHED", count: counts.published },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Admin · Blog"
        title="Articles"
        description="Gestiona els articles del blog"
        action={
          <Link href="/admin/blog/nou">
            <Button variant="accent" className="gap-2">
              <Plus className="h-4 w-4" />
              Nou article
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.label}
            href={
              filter.value
                ? `/admin/blog?status=${filter.value}${categoryFilter ? `&category=${categoryFilter}` : ""}`
                : `/admin/blog${categoryFilter ? `?category=${categoryFilter}` : ""}`
            }
          >
            <Button
              variant={
                statusFilter === filter.value || (!statusFilter && !filter.value)
                  ? "default"
                  : "ghost"
              }
              size="sm"
              className="gap-1.5"
            >
              {filter.label}
              <Badge variant="secondary" className="ml-1">
                {filter.count}
              </Badge>
            </Button>
          </Link>
        ))}
      </div>

      {/* Posts list */}
      <Card>
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PenSquare className="h-12 w-12 text-foreground/20 mb-4" />
              <p className="text-foreground/50 text-lg">No hi ha articles</p>
              <p className="text-foreground/30 text-sm mt-1">
                {statusFilter || categoryFilter
                  ? "Cap article amb aquest filtre"
                  : "Crea el primer article del blog"}
              </p>
              {!statusFilter && !categoryFilter && (
                <Link href="/admin/blog/nou" className="mt-4">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nou article
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-4">Slug · Titol</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-3">Idiomes</div>
                <div className="col-span-2">Darrer canvi</div>
                <div className="col-span-1 text-right">Blocs</div>
              </div>
              {groups.map((group) => {
                const defaultVariant =
                  group.variants.find((v) => v.locale === "ca") ??
                  group.variants[0];
                return (
                  <div
                    key={group.groupKey}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/20 transition-colors"
                  >
                    <div className="col-span-4 min-w-0">
                      <Link
                        href={`/admin/blog/${defaultVariant.id}`}
                        className="block group"
                      >
                        <p className="text-sm font-mono text-foreground/80 truncate group-hover:text-accent transition-colors">
                          {group.displayKey}
                        </p>
                        <p className="text-xs text-foreground/40 truncate mt-0.5">
                          {defaultVariant.title}
                        </p>
                      </Link>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary">
                        {categoryLabels[group.category] || group.category}
                      </Badge>
                    </div>
                    <div className="col-span-3">
                      <LocalePills
                        variants={group.variants}
                        editPrefix="/admin/blog"
                        createPrefixForSlug={`/admin/blog/nou?translationKey=${encodeURIComponent(group.displayKey)}`}
                      />
                    </div>
                    <div className="col-span-2 text-sm text-foreground/40 font-mono">
                      {formatDate(group.lastUpdated)}
                    </div>
                    <div className="col-span-1 text-right text-sm text-foreground/40 font-mono">
                      {group.totalBlocks}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
