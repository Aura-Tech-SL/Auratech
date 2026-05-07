export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  PenSquare,
  Wrench,
  FolderKanban,
  Mail,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminDashboard() {
  const [
    totalPages,
    totalPosts,
    totalServices,
    totalProjects,
    totalSubmissions,
    unreadSubmissions,
    recentPages,
    recentPosts,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.blogPost.count(),
    prisma.service.count(),
    prisma.project.count(),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
    prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Pagines", value: totalPages, icon: FileText, href: "/admin/pagines" },
    { label: "Articles", value: totalPosts, icon: PenSquare, href: "/admin/blog" },
    { label: "Serveis", value: totalServices, icon: Wrench, href: "/admin/serveis" },
    { label: "Projectes", value: totalProjects, icon: FolderKanban, href: "/admin/projectes" },
    { label: "Missatges", value: totalSubmissions, icon: Mail, href: "/admin/contacte", badge: unreadSubmissions > 0 ? unreadSubmissions : undefined },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Visió general"
        title="Panell d'administracio"
        description="Resum general del contingut del lloc web"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-accent/30 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-foreground/40" />
                  {stat.badge && (
                    <Badge variant="accent">{stat.badge} nous</Badge>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-foreground/50 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/pagines/nova">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova pagina
              </Button>
            </Link>
            <Link href="/admin/blog/nou">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Nou article
              </Button>
            </Link>
            <Link href="/admin/contacte">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Veure missatges
                {unreadSubmissions > 0 && (
                  <Badge variant="accent" className="ml-1">{unreadSubmissions}</Badge>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pagines recents</CardTitle>
            <Link href="/admin/pagines">
              <Button variant="ghost" size="sm" className="gap-1">
                Veure totes <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPages.length === 0 ? (
              <p className="text-foreground/40 text-sm">Encara no hi ha pagines</p>
            ) : (
              <div className="space-y-3">
                {recentPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/admin/pagines/${page.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-accent transition-colors">
                        {page.title}
                      </p>
                      <p className="text-xs text-foreground/40 font-mono mt-0.5">
                        /{page.slug} &middot; {page.author.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
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
                      <span className="text-xs text-foreground/30 font-mono">
                        {formatDate(page.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent blog posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Articles recents</CardTitle>
            <Link href="/admin/blog">
              <Button variant="ghost" size="sm" className="gap-1">
                Veure tots <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-foreground/40 text-sm">Encara no hi ha articles</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/blog/${post.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-accent transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-foreground/40 font-mono mt-0.5">
                        /{post.slug} &middot; {post.author.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Badge
                        variant={post.status === "PUBLISHED" ? "accent" : "outline"}
                      >
                        {post.status === "PUBLISHED" ? "Publicat" : "Esborrany"}
                      </Badge>
                      <span className="text-xs text-foreground/30 font-mono">
                        {formatDate(post.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
