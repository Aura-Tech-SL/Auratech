import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, Calendar, ArrowRight, MessageSquare, Mail } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function ProjectesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  try {
    projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB hiccup — render empty state instead of 500
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Els meus projectes</h1>
        <p className="text-muted-foreground mt-1">
          Segueix l&apos;estat de tots els teus projectes
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Encara no tens projectes</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Quan tinguem un projecte en marxa amb tu, apareixerà aquí amb
                l&apos;estat, fites i documents associats. Per posar-lo en marxa,
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
              </a>
              <a
                href={buildWhatsappLink(
                  "Hola, soc client d'Auratech i voldria iniciar un projecte.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                data-cta-location="dashboard_projects_empty"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {project.category}
                        </span>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {project.startDate ? formatDate(project.startDate) : "—"}
                          {" - "}
                          {project.endDate ? formatDate(project.endDate) : "—"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[160px]">
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {getStatusLabel(project.status)}
                    </Badge>
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progrés</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted w-full">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/dashboard/projectes/${project.id}`}>
                      <Button variant="outline" size="sm">
                        Veure detalls
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
