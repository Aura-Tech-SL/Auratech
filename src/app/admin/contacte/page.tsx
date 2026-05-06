import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminContactePage({
  searchParams,
}: {
  searchParams: { isRead?: string; q?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isAdmin(session.user.role)) redirect("/dashboard");

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = 20;
  const isReadParam = searchParams.isRead;
  const q = searchParams.q?.trim();

  const where: {
    isRead?: boolean;
    OR?: Array<Record<string, { contains: string; mode: "insensitive" }>>;
  } = {};
  if (isReadParam === "true") where.isRead = true;
  else if (isReadParam === "false") where.isRead = false;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [submissions, total, unreadCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.count({ where: { isRead: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="h-7 w-7" />
            Contacte
          </h1>
          <p className="text-muted-foreground mt-1">
            Missatges rebuts del formulari de contacte
            {unreadCount > 0 && (
              <>
                {" "}— <strong className="text-accent">{unreadCount} no llegits</strong>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Cerca per nom, email, assumpte o contingut…"
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-sm"
          />
        </div>
        <select
          name="isRead"
          defaultValue={isReadParam || ""}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
          <option value="">Tots</option>
          <option value="false">No llegits</option>
          <option value="true">Llegits</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-foreground text-background rounded-md text-sm hover:bg-foreground/90"
        >
          Filtrar
        </button>
        {(q || isReadParam) && (
          <Link
            href="/admin/contacte"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Netejar
          </Link>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              {q || isReadParam ? "Cap missatge coincideix amb el filtre." : "Encara no hi ha cap missatge."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estat</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">De</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assumpte</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b hover:bg-muted/30 transition-colors ${
                        !s.isRead ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        {!s.isRead ? (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            Nou
                          </Badge>
                        ) : (
                          <Badge variant="outline">Llegit</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/contacte/${s.id}`}
                          className="font-medium hover:text-accent"
                        >
                          {s.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/contacte/${s.id}`}
                          className="hover:text-accent text-sm"
                        >
                          {s.subject}
                        </Link>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(s.createdAt)}
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
            if (q) params.set("q", q);
            if (isReadParam) params.set("isRead", isReadParam);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/contacte?${params.toString()}`}
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
