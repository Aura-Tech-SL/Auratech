export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminServeisPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { locale: "asc" }],
  });

  // Group by slug for visual collation across locales.
  const grouped = new Map<
    string,
    { slug: string; order: number; locales: typeof services }
  >();
  for (const s of services) {
    const entry = grouped.get(s.slug) ?? {
      slug: s.slug,
      order: s.order,
      locales: [],
    };
    entry.locales.push(s);
    grouped.set(s.slug, entry);
  }

  const groups = Array.from(grouped.values()).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Admin · Catàleg"
        title="Serveis"
        description="Catàleg públic mostrat a /serveis. Cada servei pot tenir variants per idioma."
        icon={<Wrench className="h-7 w-7 text-foreground/40" />}
      />

      <Card>
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <div className="py-16 text-center text-foreground/40">
              No hi ha serveis encara
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                <div className="col-span-1">Ordre</div>
                <div className="col-span-3">Slug</div>
                <div className="col-span-5">Nom (per idioma)</div>
                <div className="col-span-2">Idiomes</div>
                <div className="col-span-1 text-right">Actiu</div>
              </div>
              {groups.map((group) => {
                const allActive = group.locales.every((l) => l.isActive);
                return (
                  <div
                    key={group.slug}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-start"
                  >
                    <div className="col-span-1 text-sm text-foreground/40 font-mono">
                      {group.order}
                    </div>
                    <div className="col-span-3 text-sm font-mono text-foreground/60 truncate">
                      /{group.slug}
                    </div>
                    <div className="col-span-5 space-y-0.5">
                      {group.locales.map((s) => (
                        <div key={s.id} className="text-sm text-foreground/80">
                          <span className="inline-block w-7 text-[11px] uppercase font-mono text-foreground/40">
                            {s.locale}
                          </span>
                          {s.name}
                        </div>
                      ))}
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {group.locales.map((s) => (
                        <Badge
                          key={s.id}
                          variant="secondary"
                          className="text-[10px] uppercase font-mono"
                        >
                          {s.locale}
                        </Badge>
                      ))}
                    </div>
                    <div className="col-span-1 text-right">
                      <Badge variant={allActive ? "accent" : "outline"}>
                        {allActive ? "Sí" : "No"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-foreground/40">
        L&apos;edició inline encara no està disponible des de l&apos;admin.
        Per modificar text o ordre, usa l&apos;API <code className="font-mono">/api/services/[id]</code>{" "}
        o el reordenament a <code className="font-mono">/api/services/reorder</code>.
      </p>
    </div>
  );
}
