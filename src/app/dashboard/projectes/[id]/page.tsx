import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ownsResource } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });
  if (!project) notFound();

  // Ownership check — clients only see their own projects; admins see anything.
  if (!ownsResource(project.userId, session)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard/projectes">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tornar a projectes
        </Button>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">
            Projecte · {project.category}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-light tracking-tight">{project.name}</h1>
            <Badge className={getStatusColor(project.status)} variant="outline">
              {getStatusLabel(project.status)}
            </Badge>
          </div>
          {project.description && (
            <p className="text-foreground/60 mt-2 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground/60">
              Estat del projecte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
                  Progrés
                </span>
                <span className="text-sm tabular-nums">{project.progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {project.technologies.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40 mb-2">
                  Tecnologies
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground/60">
              Calendari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-foreground/40" />
              <span className="text-foreground/50">Inici:</span>
              <span className="font-mono text-foreground/80">
                {project.startDate ? formatDate(project.startDate) : "Per determinar"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-foreground/40" />
              <span className="text-foreground/50">Final:</span>
              <span className="font-mono text-foreground/80">
                {project.endDate ? formatDate(project.endDate) : "Per determinar"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
