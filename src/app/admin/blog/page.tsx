export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, PenSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface BlogPageProps {
  searchParams: { status?: string; category?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const statusFilter = searchParams.status || undefined;
  const categoryFilter = searchParams.category || undefined;

  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (categoryFilter) where.category = categoryFilter;

  const [posts, counts] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { blocks: true } },
      },
    }),
    Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    ]),
  ]);

  const [total, drafts, published] = counts;

  const statusFilters = [
    { label: "Tots", value: undefined, count: total },
    { label: "Esborranys", value: "DRAFT", count: drafts },
    { label: "Publicats", value: "PUBLISHED", count: published },
  ];

  const categoryLabels: Record<string, string> = {
    IOT: "IoT",
    CLOUD: "Cloud",
    STRATEGY: "Estrategia",
    GENERAL: "General",
  };

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

      {/* Posts list */}
      <Card>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PenSquare className="h-12 w-12 text-foreground/20 mb-4" />
              <p className="text-foreground/50 text-lg">No hi ha articles</p>
              <p className="text-foreground/30 text-sm mt-1">
                Crea el primer article del blog
              </p>
              <Link href="/admin/blog/nou" className="mt-4">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nou article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-3">Titol</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-1">Idioma</div>
                <div className="col-span-2">Estat</div>
                <div className="col-span-1">Blocs</div>
                <div className="col-span-2">Actualitzat</div>
                <div className="col-span-1">Autor</div>
              </div>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors items-center group"
                >
                  <div className="col-span-3">
                    <p className="font-medium truncate group-hover:text-accent transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-foreground/30 font-mono mt-0.5 truncate">
                      /{post.slug}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary">
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <Badge variant="secondary" className="text-xs uppercase">
                      {(post as any).locale || "ca"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={post.status === "PUBLISHED" ? "accent" : "outline"}>
                      {post.status === "PUBLISHED" ? "Publicat" : "Esborrany"}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-foreground/40 font-mono">
                      {post._count.blocks}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-foreground/40 font-mono">
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-foreground/50 truncate">
                      {post.author.name}
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
