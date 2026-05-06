"use client";

import { motion } from "framer-motion";
import { Receipt, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from "@/lib/utils";

const invoices = [
  {
    number: "FAC-2026-001",
    concept: "Desenvolupament web - Fase 1",
    amount: 3500,
    status: "PAID",
    dueDate: "2026-01-15",
    paidAt: "2026-01-12",
  },
  {
    number: "FAC-2026-002",
    concept: "Disseny UX/UI - Portal corporatiu",
    amount: 1250,
    status: "PENDING",
    dueDate: "2026-02-28",
    paidAt: null,
  },
  {
    number: "FAC-2026-003",
    concept: "Manteniment mensual - Gener 2026",
    amount: 450,
    status: "PENDING",
    dueDate: "2026-03-01",
    paidAt: null,
  },
  {
    number: "FAC-2025-012",
    concept: "Consultoria IT - Anàlisi de requeriments",
    amount: 800,
    status: "PAID",
    dueDate: "2025-12-15",
    paidAt: "2025-12-14",
  },
  {
    number: "FAC-2025-011",
    concept: "Desenvolupament App - Prototip",
    amount: 2200,
    status: "PAID",
    dueDate: "2025-11-30",
    paidAt: "2025-11-28",
  },
];

const totalPending = invoices
  .filter((i) => i.status === "PENDING")
  .reduce((acc, i) => acc + i.amount, 0);
const totalPaid = invoices
  .filter((i) => i.status === "PAID")
  .reduce((acc, i) => acc + i.amount, 0);

export default function FacturesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Factures</h1>
        <p className="text-muted-foreground mt-1">Historial de factures i pagaments</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total pendent</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total pagat</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total factures</div>
            <div className="text-2xl font-bold mt-1">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Factura</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Concepte</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Import</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Venciment</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Estat</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 text-sm font-medium">{invoice.number}</td>
                    <td className="py-4 text-sm">{invoice.concept}</td>
                    <td className="py-4 text-sm font-semibold">{formatCurrency(invoice.amount)}</td>
                    <td className="py-4 text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                    <td className="py-4">
                      <Badge className={getStatusColor(invoice.status)} variant="outline">
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
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
