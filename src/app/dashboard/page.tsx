"use client";

import { motion } from "framer-motion";
import {
  FolderKanban,
  Receipt,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";

// Mock data - en producció ve de l'API
const stats = [
  { title: "Projectes actius", value: "3", icon: FolderKanban, change: "+1 aquest mes" },
  { title: "Factures pendents", value: "2", icon: Receipt, change: "1.250,00 EUR" },
  { title: "Missatges nous", value: "5", icon: MessageSquare, change: "3 sense llegir" },
  { title: "Progrés global", value: "72%", icon: TrendingUp, change: "+8% aquesta setmana" },
];

const recentProjects = [
  { id: "1", title: "Redisseny portal web", status: "IN_PROGRESS", progress: 65 },
  { id: "2", title: "App mòbil de reserves", status: "REVIEW", progress: 90 },
  { id: "3", title: "Dashboard d'analytics", status: "PENDING", progress: 15 },
];

const recentInvoices = [
  { number: "FAC-2026-001", concept: "Desenvolupament web - Fase 1", amount: 3500, status: "PAID" },
  { number: "FAC-2026-002", concept: "Disseny UX/UI", amount: 1250, status: "PENDING" },
  { number: "FAC-2026-003", concept: "Manteniment mensual", amount: 450, status: "PENDING" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Benvingut/da al teu espai de client</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className="text-xs text-primary mt-1">{stat.change}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projectes recents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium text-sm">{project.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded-full bg-muted max-w-[120px]">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)} variant="outline">
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimes factures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.number} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{invoice.concept}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {invoice.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatCurrency(invoice.amount)}</div>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
