export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, FileText, Info, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LocalePills, type LocaleVariant } from "@/components/admin/locale-pills";

interface PaginesPageProps {
  searchParams: { status?: string };
}

interface PageGroup {
  slug: string;
  variants: Array<
    LocaleVariant & {
      title: string;
      blockCount: number;
      authorName: string;
    }
  >;
  lastUpdated: Date;
  totalBlocks: number;
}

export default async function PaginesPage({ searchParams }: PaginesPageProps) {
  const statusFilter = searchParams.status || undefined;

  const allRows = await prisma.page.findMany({
    orderBy: [{ slug: "asc" }, { locale: "asc" }],
    include: {
      author: { select: { name: true } },
      _count: { select: { blocks: true } },
    },
  });

  // Group by slug. A group passes the status filter if at least one of its
  // locale variants matches the filter — "show me drafts" surfaces slugs that
  // have any draft variant.
  const groupsMap = new Map<string, PageGroup>();
  for (const row of allRows) {
    const g = groupsMap.get(row.slug) ?? {
      slug: row.slug,
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
      blockCount: row._count.blocks,
      authorName: row.author.name,
    });
    if (row.updatedAt > g.lastUpdated) g.lastUpdated = row.updatedAt;
    g.totalBlocks = Math.max(g.totalBlocks, row._count.blocks);
    groupsMap.set(row.slug, g);
  }

  let groups = Array.from(groupsMap.values()).sort(
    (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
  );

  if (statusFilter) {
    groups = groups.filter((g) =>
      g.variants.some((v) => v.status === statusFilter),
    );
  }

  // Counts use the group dimension (per slug) so the filter pill numbers
  // match what the user actually sees as rows.
  const counts = {
    total: groupsMap.size,
    drafts: Array.from(groupsMap.values()).filter((g) =>
      g.variants.some((v) => v.status === "DRAFT"),
    ).length,
    published: Array.from(groupsMap.values()).filter((g) =>
      g.variants.some((v) => v.status === "PUBLISHED"),
    ).length,
    archived: Array.from(groupsMap.values()).filter((g) =>
      g.variants.some((v) => v.status === "ARCHIVED"),
    ).length,
  };

  const filters = [
    { label: "Totes", value: undefined, count: counts.total },
    { label: "Esborranys", value: "DRAFT", count: counts.drafts },
    { label: "Publicades", value: "PUBLISHED", count: counts.published },
    { label: "Arxivades", value: "ARCHIVED", count: counts.archived },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Admin · Contingut"
        title="Pagines"
        description="Gestiona les pagines del lloc web"
        action={
          <Link href="/admin/pagines/nova">
            <Button variant="accent" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova pagina
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={
              filter.value
                ? `/admin/pagines?status=${filter.value}`
                : "/admin/pagines"
            }
          >
            <Button
              variant={statusFilter === filter.value || (!statusFilter && !filter.value) ? "default" : "ghost"}
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

      {/* Pages list */}
      <Card>
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-foreground/20 mb-4" />
              <p className="text-foreground/50 text-lg">No hi ha pagines</p>
              <p className="text-foreground/30 text-sm mt-1">
                {statusFilter
                  ? "Cap pagina amb aquest filtre"
                  : "Crea la primera pagina del lloc web"}
              </p>
              {!statusFilter && (
                <Link href="/admin/pagines/nova" className="mt-4">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova pagina
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-3">Slug · Titol</div>
                <div className="col-span-3">Idiomes</div>
                <div className="col-span-1">Blocs</div>
                <div className="col-span-3">Darrer canvi</div>
                <div className="col-span-2">Autor</div>
              </div>
              {groups.map((group) => {
                const defaultVariant =
                  group.variants.find((v) => v.locale === "ca") ??
                  group.variants[0];
                return (
                  <div
                    key={group.slug}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/20 transition-colors"
                  >
                    <div className="col-span-3 min-w-0">
                      <Link
                        href={`/admin/pagines/${defaultVariant.id}`}
                        className="block group"
                      >
                        <p className="text-sm font-mono text-foreground/80 truncate group-hover:text-accent transition-colors">
                          /{group.slug}
                        </p>
                        <p className="text-xs text-foreground/40 truncate mt-0.5">
                          {defaultVariant.title}
                        </p>
                      </Link>
                    </div>
                    <div className="col-span-3">
                      <LocalePills
                        variants={group.variants}
                        editPrefix="/admin/pagines"
                        createPrefixForSlug={`/admin/pagines/nova?slug=${encodeURIComponent(group.slug)}`}
                      />
                    </div>
                    <div className="col-span-1 text-sm text-foreground/40 font-mono">
                      {group.totalBlocks}
                    </div>
                    <div className="col-span-3 text-sm text-foreground/40 font-mono">
                      {formatDate(group.lastUpdated)}
                    </div>
                    <div className="col-span-2 text-sm text-foreground/50 truncate">
                      {defaultVariant.authorName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Static (code-driven) pages — read-only reference */}
      <div className="pt-4">
        <div className="mb-3 flex items-start gap-2 text-sm text-foreground/50">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-foreground/40" />
          <p>
            Aquestes pàgines viuen al codi (
            <code className="font-mono text-xs">src/app/[locale]/(public)/</code>),
            no a la BBDD. Per editar el seu contingut cal un canvi al repositori. Les
            llisto aquí com a referència de la superfície pública total.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-4">Ruta pública</div>
                <div className="col-span-7">Descripció</div>
                <div className="col-span-1 text-right">Visitar</div>
              </div>
              {STATIC_PAGES.map((p) => (
                <a
                  key={p.path}
                  href={`https://auratech.cat/ca${p.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-secondary/30 transition-colors items-center group"
                >
                  <div className="col-span-4 text-sm font-mono text-foreground/70 truncate">
                    /[locale]{p.path}
                  </div>
                  <div className="col-span-7 text-sm text-foreground/50 truncate">
                    {p.description}
                  </div>
                  <div className="col-span-1 text-right">
                    <ExternalLink className="h-3.5 w-3.5 text-foreground/30 group-hover:text-accent transition-colors inline" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const STATIC_PAGES = [
  { path: "", description: "Home — landing principal" },
  { path: "/serveis", description: "Catàleg de serveis (cards des de Service model)" },
  { path: "/projectes", description: "Portfolio de projectes" },
  { path: "/casos", description: "Casos d'èxit destacats" },
  { path: "/labs", description: "Labs / experiments interns" },
  { path: "/blog", description: "Llistat de posts (continguts a la BBDD via /admin/blog)" },
  { path: "/contacte", description: "Formulari de contacte" },
  { path: "/avis-legal", description: "Avís legal" },
  { path: "/privacitat", description: "Política de privacitat" },
  { path: "/cookies", description: "Política de cookies" },
];
