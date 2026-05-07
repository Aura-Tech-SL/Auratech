"use client";

import { motion } from "framer-motion";
import { Users, Mail, Building, MoreVertical, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const clients = [
  {
    id: "1",
    name: "Oscar Rovira",
    email: "oscar.rovira@auratech.cat",
    company: "Auratech",
    projects: 3,
    status: "active",
    joinedAt: "2025-11-01",
  },
  {
    id: "2",
    name: "Laura Martí",
    email: "laura@example.com",
    company: "Botiga Gourmet",
    projects: 1,
    status: "active",
    joinedAt: "2025-12-15",
  },
  {
    id: "3",
    name: "Pau Serrat",
    email: "pau@example.com",
    company: "Fitness Pro",
    projects: 2,
    status: "active",
    joinedAt: "2026-01-10",
  },
];

export default function AdminClientsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Persones"
        title="Clients"
        description="Gestió de clients d'Auratech"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nou client
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Projectes</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estat</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data registre</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {client.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{client.company}</td>
                    <td className="p-4 text-sm">{client.projects}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Actiu
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(client.joinedAt).toLocaleDateString("ca-ES")}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
