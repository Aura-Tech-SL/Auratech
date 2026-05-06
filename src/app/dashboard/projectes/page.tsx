"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderKanban, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

const projects = [
  {
    id: "1",
    title: "Redisseny portal web corporatiu",
    description: "Redisseny complet del portal web amb nova imatge de marca i funcionalitats modernes.",
    status: "IN_PROGRESS",
    progress: 65,
    category: "Web",
    startDate: "2025-11-01",
    endDate: "2026-03-15",
  },
  {
    id: "2",
    title: "App mòbil de reserves",
    description: "Aplicació mòbil per gestionar reserves i cites amb notificacions automàtiques.",
    status: "REVIEW",
    progress: 90,
    category: "Mòbil",
    startDate: "2025-10-15",
    endDate: "2026-02-28",
  },
  {
    id: "3",
    title: "Dashboard d'analytics",
    description: "Panell de control amb mètriques de negoci en temps real i informes automatitzats.",
    status: "PENDING",
    progress: 15,
    category: "Web App",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
  },
];

export default function ProjectesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Els meus projectes</h1>
        <p className="text-muted-foreground mt-1">Segueix l&apos;estat de tots els teus projectes</p>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <span className="text-xs text-muted-foreground">{project.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </div>
                    </div>
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
