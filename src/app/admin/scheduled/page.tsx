export const dynamic = "force-dynamic";

import Link from "next/link";
import { Calendar, Clock, FileText, PenSquare } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface ScheduledItem {
  id: string;
  kind: "page" | "post";
  title: string;
  slug: string;
  locale: string;
  publishAt: Date;
  authorName: string;
  href: string;
}

export default async function ScheduledPage() {
  const [pages, posts] = await Promise.all([
    prisma.page.findMany({
      where: { status: "SCHEDULED", publishAt: { not: null } },
      orderBy: { publishAt: "asc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.blogPost.findMany({
      where: { status: "SCHEDULED", publishAt: { not: null } },
      orderBy: { publishAt: "asc" },
      include: { author: { select: { name: true } } },
    }),
  ]);

  const items: ScheduledItem[] = [
    ...pages.map<ScheduledItem>((p) => ({
      id: p.id,
      kind: "page",
      title: p.title,
      slug: p.slug,
      locale: p.locale,
      publishAt: p.publishAt!,
      authorName: p.author.name,
      href: `/admin/pagines/${p.id}`,
    })),
    ...posts.map<ScheduledItem>((p) => ({
      id: p.id,
      kind: "post",
      title: p.title,
      slug: p.slug,
      locale: p.locale,
      publishAt: p.publishAt!,
      authorName: p.author.name,
      href: `/admin/blog/${p.id}`,
    })),
  ].sort((a, b) => a.publishAt.getTime() - b.publishAt.getTime());

  const now = new Date();
  const overdue = items.filter((i) => i.publishAt <= now);
  const upcoming = items.filter((i) => i.publishAt > now);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Programació"
        title="Publicacions programades"
        description="Pàgines i articles que es publicaran automàticament. El cron passa cada 5 minuts."
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="h-14 w-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">
              Cua buida
            </p>
            <h3 className="text-2xl font-light tracking-tight">
              No hi ha res programat
            </h3>
            <p className="text-sm text-foreground/50 max-w-md mx-auto">
              Quan programis una pàgina o un article des del seu editor,
              apareixerà aquí amb l&apos;hora prevista de publicació.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <SectionTable
              label={`Pendents · ${overdue.length}`}
              accent="amber"
              note="Aquests ítems haurien d'haver-se publicat ja. Si segueixen aquí, el cron no està executant-se correctament."
              items={overdue}
            />
          )}
          <SectionTable
            label={`Properes · ${upcoming.length}`}
            accent="accent"
            items={upcoming}
          />
        </div>
      )}
    </div>
  );
}

function SectionTable({
  label,
  accent,
  note,
  items,
}: {
  label: string;
  accent: "accent" | "amber";
  note?: string;
  items: ScheduledItem[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <SectionHeader label={label} accent={accent} note={note} />
        <Card>
          <CardContent className="px-6 py-8 text-center text-sm text-foreground/40">
            Res a la llista.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader label={label} accent={accent} note={note} />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <ScheduledRow key={`${it.kind}_${it.id}`} item={it} />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({
  label,
  accent,
  note,
}: {
  label: string;
  accent: "accent" | "amber";
  note?: string;
}) {
  return (
    <div className="mb-3 space-y-1">
      <p
        className={`text-[10px] font-mono uppercase tracking-wider ${
          accent === "amber" ? "text-amber-500/80" : "text-accent/80"
        }`}
      >
        {label}
      </p>
      {note && <p className="text-xs text-foreground/50">{note}</p>}
    </div>
  );
}

function ScheduledRow({ item }: { item: ScheduledItem }) {
  const Icon = item.kind === "page" ? FileText : PenSquare;
  const kindLabel = item.kind === "page" ? "Pàgina" : "Article";
  const when = item.publishAt;
  const dateStr = when.toLocaleDateString("ca-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = when.toLocaleTimeString("ca-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center gap-4 px-5 py-4 hover:bg-accent/[0.04] transition-colors group"
      >
        <div className="h-10 w-10 rounded-md border border-border bg-secondary/30 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-foreground/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            <span>{kindLabel}</span>
            <span>·</span>
            <span>{item.locale.toUpperCase()}</span>
          </div>
          <p className="font-medium truncate group-hover:text-accent transition-colors mt-0.5">
            {item.title}
          </p>
          <p className="text-[11px] font-mono text-foreground/40 mt-0.5 truncate">
            /{item.slug} · {item.authorName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5">
            <Clock className="h-3 w-3" />
            <span className="font-mono tabular-nums">{dateStr} · {timeStr}</span>
          </Badge>
        </div>
      </Link>
    </li>
  );
}
