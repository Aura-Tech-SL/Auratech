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
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge className={getStatusColor(project.status)} variant="outline">
              {getStatusLabel(project.status)}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Estat del projecte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progrés</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {project.technologies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Tecnologies</h4>
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
            <CardTitle className="text-lg">Calendari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Inici:</span>
              <span className="font-medium">
                {project.startDate ? formatDate(project.startDate) : "Per determinar"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Final:</span>
              <span className="font-medium">
                {project.endDate ? formatDate(project.endDate) : "Per determinar"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
