"use client";

import { motion } from "framer-motion";
import { FolderKanban, Plus, MoreVertical, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const projects = [
  {
    id: "1",
    title: "Redisseny portal web corporatiu",
    client: "Oscar Rovira",
    status: "IN_PROGRESS",
    progress: 65,
    startDate: "2025-11-01",
    endDate: "2026-03-15",
  },
  {
    id: "2",
    title: "App mòbil de reserves",
    client: "Laura Martí",
    status: "REVIEW",
    progress: 90,
    startDate: "2025-10-15",
    endDate: "2026-02-28",
  },
  {
    id: "3",
    title: "Dashboard d'analytics",
    client: "Pau Serrat",
    status: "PENDING",
    progress: 15,
    startDate: "2026-02-01",
    endDate: "2026-06-30",
  },
  {
    id: "4",
    title: "Portal E-commerce Gourmet",
    client: "Laura Martí",
    status: "COMPLETED",
    progress: 100,
    startDate: "2025-06-01",
    endDate: "2025-10-30",
  },
];

export default function AdminProjectesPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Operacions"
        title="Projectes"
        description="Gestió de tots els projectes"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nou projecte
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: projects.length },
          { label: "En progrés", value: projects.filter(p => p.status === "IN_PROGRESS").length },
          { label: "En revisió", value: projects.filter(p => p.status === "REVIEW").length },
          { label: "Completats", value: projects.filter(p => p.status === "COMPLETED").length },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{project.title}</div>
                    <div className="text-sm text-muted-foreground">Client: {project.client}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)} variant="outline">
                    {getStatusLabel(project.status)}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
