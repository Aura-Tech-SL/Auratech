import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  Receipt,
  MessageSquare,
  Mail,
  ArrowRight,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function fetchClientStats(userId: string) {
  const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await p;
    } catch {
      return fallback;
    }
  };

  const [activeProjects, pendingInvoices, unreadMessages, recentProjects, recentInvoices] = await Promise.all([
    safe(
      prisma.project.count({
        where: { userId, status: { in: ["PENDING", "IN_PROGRESS", "REVIEW"] } },
      }),
      0,
    ),
    safe(prisma.invoice.count({ where: { userId, status: "PENDING" } }), 0),
    safe(
      prisma.message.count({ where: { receiverId: userId, isRead: false } }),
      0,
    ),
    safe(
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      [] as Awaited<ReturnType<typeof prisma.project.findMany>>,
    ),
    safe(
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      [] as Awaited<ReturnType<typeof prisma.invoice.findMany>>,
    ),
  ]);

  return {
    activeProjects,
    pendingInvoices,
    unreadMessages,
    recentProjects,
    recentInvoices,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const stats = await fetchClientStats(userId);

  const cards = [
    {
      label: "Projectes actius",
      value: stats.activeProjects,
      icon: FolderKanban,
      href: "/dashboard/projectes",
    },
    {
      label: "Factures pendents",
      value: stats.pendingInvoices,
      icon: Receipt,
      href: "/dashboard/factures",
    },
    {
      label: "Missatges sense llegir",
      value: stats.unreadMessages,
      icon: MessageSquare,
      href: "/dashboard/missatges",
    },
  ];

  const hasAnyActivity =
    stats.recentProjects.length > 0 || stats.recentInvoices.length > 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="El meu espai"
        title={`Hola, ${session.user.name?.split(" ")[0] ?? ""}`}
        description="Resum dels teus projectes, factures i missatges."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:border-accent/30 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <card.icon className="h-5 w-5 text-foreground/40" />
                <p className="text-3xl font-light tracking-tight mt-3 tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs font-mono uppercase tracking-wider text-foreground/40 mt-1">
                  {card.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasAnyActivity ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground/60">
                Projectes recents
              </CardTitle>
              <Link href="/dashboard/projectes">
                <Button variant="ghost" size="sm" className="gap-1">
                  Veure tots <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentProjects.length === 0 ? (
                <p className="text-sm text-foreground/40">
                  Encara no tens projectes assignats.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projectes/${project.id}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1 rounded-full bg-foreground/10 max-w-[120px] flex-1">
                            <div
                              className="h-full rounded-full bg-accent transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-foreground/40 tabular-nums">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)} variant="outline">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground/60">
                Últimes factures
              </CardTitle>
              <Link href="/dashboard/factures">
                <Button variant="ghost" size="sm" className="gap-1">
                  Veure totes <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentInvoices.length === 0 ? (
                <p className="text-sm text-foreground/40">
                  Encara no tens factures.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <p className="font-mono text-sm text-foreground/80">
                        {invoice.number}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(Number(invoice.total))}
                        </span>
                        <Badge className={getStatusColor(invoice.status)} variant="outline">
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <FolderKanban className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">
                Espai personalitzat
              </p>
              <h3 className="text-2xl font-light tracking-tight">
                Encara no tens activitat
              </h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto">
                Aquí veuràs els teus projectes, factures i missatges quan
                tinguem un projecte en marxa amb tu.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <a
                href="mailto:sandra.romero@auratech.cat"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Sandra
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={buildWhatsappLink(
                  "Hola, soc client d'Auratech i voldria iniciar un projecte.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                data-cta-location="dashboard_empty_state"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-md text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
