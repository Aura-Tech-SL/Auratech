export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LocalePills, type LocaleVariant } from "@/components/admin/locale-pills";

interface ServiceGroup {
  slug: string;
  order: number;
  caName?: string;
  variants: Array<LocaleVariant & { name: string; isActive: boolean }>;
}

export default async function AdminServeisPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { locale: "asc" }],
  });

  const grouped = new Map<string, ServiceGroup>();
  for (const s of services) {
    const g = grouped.get(s.slug) ?? {
      slug: s.slug,
      order: s.order,
      variants: [],
    };
    g.variants.push({
      id: s.id,
      locale: s.locale,
      // Map "isActive" onto the status semantics so pills color consistently.
      status: s.isActive ? "PUBLISHED" : "ARCHIVED",
      updatedAt: s.updatedAt,
      name: s.name,
      isActive: s.isActive,
    });
    if (s.locale === "ca") g.caName = s.name;
    grouped.set(s.slug, g);
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
                <div className="col-span-5">Slug · Nom (CA)</div>
                <div className="col-span-6">Idiomes</div>
              </div>
              {groups.map((group) => (
                <div
                  key={group.slug}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                >
                  <div className="col-span-1 text-sm text-foreground/40 font-mono">
                    {group.order}
                  </div>
                  <div className="col-span-5 min-w-0">
                    <p className="text-sm font-mono text-foreground/80 truncate">
                      /{group.slug}
                    </p>
                    <p className="text-xs text-foreground/40 truncate mt-0.5">
                      {group.caName ?? group.variants[0].name}
                    </p>
                  </div>
                  <div className="col-span-6">
                    <LocalePills variants={group.variants} readOnly />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-foreground/40">
        L&apos;edició inline encara no està disponible des de l&apos;admin. Per
        modificar text o ordre, usa l&apos;API{" "}
        <code className="font-mono">/api/services/[id]</code> o el reordenament
        a <code className="font-mono">/api/services/reorder</code>.
      </p>
    </div>
  );
}
