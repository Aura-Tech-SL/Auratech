export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

interface PaginesPageProps {
  searchParams: { status?: string };
}

export default async function PaginesPage({ searchParams }: PaginesPageProps) {
  const statusFilter = searchParams.status || undefined;

  const where: any = {};
  if (statusFilter) where.status = statusFilter;

  const [pages, counts] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { blocks: true } },
      },
    }),
    Promise.all([
      prisma.page.count(),
      prisma.page.count({ where: { status: "DRAFT" } }),
      prisma.page.count({ where: { status: "PUBLISHED" } }),
      prisma.page.count({ where: { status: "ARCHIVED" } }),
    ]),
  ]);

  const [total, drafts, published, archived] = counts;

  const filters = [
    { label: "Totes", value: undefined, count: total },
    { label: "Esborranys", value: "DRAFT", count: drafts },
    { label: "Publicades", value: "PUBLISHED", count: published },
    { label: "Arxivades", value: "ARCHIVED", count: archived },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagines</h1>
          <p className="text-foreground/50 mt-1">Gestiona les pagines del lloc web</p>
        </div>
        <Link href="/admin/pagines/nova">
          <Button variant="accent" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova pagina
          </Button>
        </Link>
      </div>

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
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-foreground/20 mb-4" />
              <p className="text-foreground/50 text-lg">No hi ha pagines</p>
              <p className="text-foreground/30 text-sm mt-1">
                Crea la primera pagina del lloc web
              </p>
              <Link href="/admin/pagines/nova" className="mt-4">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova pagina
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-3">Titol</div>
                <div className="col-span-2">Slug</div>
                <div className="col-span-1">Idioma</div>
                <div className="col-span-2">Estat</div>
                <div className="col-span-1">Blocs</div>
                <div className="col-span-2">Actualitzat</div>
                <div className="col-span-1">Autor</div>
              </div>
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/admin/pagines/${page.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors items-center group"
                >
                  <div className="col-span-3">
                    <p className="font-medium truncate group-hover:text-accent transition-colors">
                      {page.title}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-foreground/40 font-mono truncate">
                      /{page.slug}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <Badge variant="secondary" className="text-xs uppercase">
                      {(page as any).locale || "ca"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant={
                        page.status === "PUBLISHED"
                          ? "accent"
                          : page.status === "DRAFT"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {page.status === "PUBLISHED"
                        ? "Publicat"
                        : page.status === "DRAFT"
                        ? "Esborrany"
                        : "Arxivat"}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-foreground/40 font-mono">
                      {page._count.blocks}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-foreground/40 font-mono">
                      {formatDate(page.updatedAt)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-foreground/50 truncate">
                      {page.author.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
