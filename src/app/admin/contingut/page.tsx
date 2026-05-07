"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const blogPosts = [
  {
    id: "1",
    title: "Les 10 tendències de desenvolupament web per al 2026",
    slug: "tendencies-web-2026",
    published: true,
    createdAt: "2026-02-10",
    views: 234,
  },
  {
    id: "2",
    title: "Com la IA està transformant les empreses catalanes",
    slug: "ia-empreses",
    published: true,
    createdAt: "2026-01-28",
    views: 187,
  },
  {
    id: "3",
    title: "Next.js vs Astro: Quina tecnologia triar?",
    slug: "nextjs-vs-astro",
    published: true,
    createdAt: "2026-01-15",
    views: 312,
  },
  {
    id: "4",
    title: "Guia de desplegament amb Docker [Esborrany]",
    slug: "docker-guide",
    published: false,
    createdAt: "2026-02-12",
    views: 0,
  },
];

export default function AdminContingutPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Contingut"
        title="Contingut"
        description="Gestió del blog i contingut del web"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nou article
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articles del blog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{post.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("ca-ES")} — {post.views} visites
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Publicat" : "Esborrany"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
