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
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function fetchClientStats(userId: string) {
  // Defensive fallbacks: if any query fails (DB hiccup), the page still
  // renders with zeros instead of returning 500.
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
      title: "Projectes actius",
      value: stats.activeProjects,
      icon: FolderKanban,
    },
    {
      title: "Factures pendents",
      value: stats.pendingInvoices,
      icon: Receipt,
    },
    {
      title: "Missatges sense llegir",
      value: stats.unreadMessages,
      icon: MessageSquare,
    },
  ];

  const hasAnyActivity =
    stats.recentProjects.length > 0 || stats.recentInvoices.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Benvingut/da, {session.user.name}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasAnyActivity ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projectes recents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Encara no tens projectes assignats.
                </p>
              ) : (
                stats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projectes/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{project.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-muted max-w-[120px]">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {getStatusLabel(project.status)}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Últimes factures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Encara no tens factures.
                </p>
              ) : (
                stats.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <div className="font-medium text-sm">{invoice.number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(Number(invoice.total))}
                      </div>
                      <Badge className={getStatusColor(invoice.status)} variant="outline">
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">El teu espai personalitzat</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Aquí veuràs els teus projectes, factures i missatges quan
                tinguem un projecte en marxa amb tu. Per posar-lo en marxa,
                contacta&apos;ns.
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
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
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
