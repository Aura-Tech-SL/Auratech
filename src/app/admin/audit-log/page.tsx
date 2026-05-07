import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  login_success: "Login OK",
  login_failed: "Login fallit",
  password_changed: "Canvi password",
  "2fa_enabled": "2FA activat",
  "2fa_disabled": "2FA desactivat",
  "2fa_failed": "2FA fallit",
  "2fa_recovery_used": "Recovery code usat",
  role_changed: "Canvi de rol",
  user_deleted: "Compte eliminat",
  user_exported: "Exportació de dades",
  page_published: "Pàgina publicada",
  page_archived: "Pàgina arxivada",
  media_deleted: "Fitxer eliminat",
};

const ACTION_TONES: Record<string, "success" | "warning" | "destructive" | "default"> = {
  login_success: "success",
  login_failed: "warning",
  "2fa_failed": "warning",
  user_deleted: "destructive",
  media_deleted: "destructive",
  page_archived: "destructive",
};

function badgeClass(action: string): string {
  const tone = ACTION_TONES[action] ?? "default";
  switch (tone) {
    case "success":
      return "bg-green-500/10 text-green-700 border-green-500/30";
    case "warning":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "destructive":
      return "bg-red-500/10 text-red-700 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

interface SearchParams {
  page?: string;
  action?: string;
  actor?: string;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPERADMIN") redirect("/admin");

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = 50;

  const where: { action?: string; actorEmail?: { contains: string; mode: "insensitive" } } =
    {};
  if (searchParams.action) where.action = searchParams.action;
  if (searchParams.actor) {
    where.actorEmail = { contains: searchParams.actor, mode: "insensitive" };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Admin · Compliance"
        title="Audit log"
        description="Registre d'esdeveniments de seguretat. Retenció: 1 any."
        icon={<ScrollText className="h-7 w-7 text-foreground/40" />}
      />

      <form className="flex flex-wrap gap-3 items-center">
        <select
          name="action"
          defaultValue={searchParams.action || ""}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
          <option value="">Totes les accions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="actor"
          defaultValue={searchParams.actor || ""}
          placeholder="Filtra per email"
          className="px-3 py-2 border rounded-md bg-background text-sm flex-1 min-w-48"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-foreground text-background rounded-md text-sm hover:bg-foreground/90"
        >
          Filtrar
        </button>
        {(searchParams.action || searchParams.actor) && (
          <Link
            href="/admin/audit-log"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Netejar
          </Link>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Cap esdeveniment registrat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Acció</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actor</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">IP</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Detall</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ca-ES")}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={badgeClass(log.action)}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {log.actorEmail || (
                          <span className="text-muted-foreground italic">anònim</span>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {log.targetType ? `${log.targetType}:${log.targetId}` : "—"}
                      </td>
                      <td className="p-3 font-mono text-xs">{log.ipAddress || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                        {Object.keys(log.metadata as object).length > 0
                          ? JSON.stringify(log.metadata)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (searchParams.action) params.set("action", searchParams.action);
            if (searchParams.actor) params.set("actor", searchParams.actor);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/audit-log?${params.toString()}`}
                className={`px-3 py-1 rounded-md ${
                  p === page
                    ? "bg-foreground text-background"
                    : "border hover:bg-muted"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
