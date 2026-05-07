import { redirect } from "next/navigation";
import { Receipt, Mail, MessageSquare } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function FacturesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  let invoices: Awaited<ReturnType<typeof prisma.invoice.findMany>> = [];
  try {
    invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // empty fallback
  }

  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((acc, i) => acc + Number(i.total), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + Number(i.total), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Factures</h1>
        <p className="text-muted-foreground mt-1">
          Historial de factures i pagaments
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Encara no tens factures</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Quan tinguem un projecte facturat amb tu, les factures
                apareixeran aquí amb estat de pagament i descàrrega del PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <a
                href="mailto:sandra.romero@auratech.cat"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Sandra
              </a>
              <a
                href={buildWhatsappLink(
                  "Hola, soc client d'Auratech i tinc dubtes sobre facturació.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                data-cta-location="dashboard_invoices_empty"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Total pendent</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(totalPending)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Total pagat</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalPaid)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Total factures</div>
                <div className="text-2xl font-bold mt-1">{invoices.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de factures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 text-sm font-medium text-muted-foreground">
                        Factura
                      </th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">
                        Import
                      </th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">
                        Venciment
                      </th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">
                        Estat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium">
                          {invoice.number}
                        </td>
                        <td className="py-4 text-sm font-semibold">
                          {formatCurrency(Number(invoice.total))}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                        </td>
                        <td className="py-4">
                          <Badge
                            className={getStatusColor(invoice.status)}
                            variant="outline"
                          >
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
