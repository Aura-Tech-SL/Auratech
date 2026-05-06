"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

// Mock data
const project = {
  id: "1",
  title: "Redisseny portal web corporatiu",
  description:
    "Redisseny complet del portal web amb nova imatge de marca, funcionalitats modernes i optimització SEO. Inclou àrea de clients, blog i formularis de contacte.",
  status: "IN_PROGRESS",
  progress: 65,
  category: "Web",
  startDate: "2025-11-01",
  endDate: "2026-03-15",
  milestones: [
    { title: "Disseny UX/UI aprovat", completed: true, date: "2025-12-01" },
    { title: "Maquetació frontend", completed: true, date: "2026-01-15" },
    { title: "Integració backend", completed: false, date: "2026-02-15" },
    { title: "Testing i QA", completed: false, date: "2026-03-01" },
    { title: "Llançament", completed: false, date: "2026-03-15" },
  ],
  team: ["Oscar R.", "Maria G.", "Jordi P."],
  technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
};

export default function ProjectDetailPage() {
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={getStatusColor(project.status)} variant="outline">
              {getStatusLabel(project.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fites del projecte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                      {milestone.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(milestone.date)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progrés total</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informació</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Categoria</div>
                <div className="font-medium text-sm">{project.category}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Dates</div>
                <div className="font-medium text-sm">
                  {formatDate(project.startDate)} — {formatDate(project.endDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Equip</div>
                <div className="flex flex-wrap gap-1">
                  {project.team.map((member) => (
                    <Badge key={member} variant="secondary">{member}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tecnologies</div>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
