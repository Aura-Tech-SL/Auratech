export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ExternalLink, Shield, KeyRound, Mail, Database } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminConfiguracioPage() {
  const sections = [
    {
      title: "Perfil i 2FA",
      description:
        "El teu compte, password i autenticació de dos factors es gestionen al dashboard personal.",
      href: "/dashboard/perfil",
      icon: Shield,
      external: false,
    },
    {
      title: "Audit log",
      description: "Registre d'esdeveniments de seguretat. Retenció: 1 any.",
      href: "/admin/audit-log",
      icon: KeyRound,
      external: false,
    },
    {
      title: "Sentry",
      description: "Error tracking de runtime. Errors nous arriben al dashboard de Sentry amb stack trace + breadcrumbs.",
      href: "https://sentry.io/",
      icon: Database,
      external: true,
    },
    {
      title: "Resend",
      description:
        "Email transaccional. Plantilles, dominis verificats i logs d'enviament viuen al panel de Resend.",
      href: "https://resend.com/",
      icon: Mail,
      external: true,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Admin · Sistema"
        title="Configuració"
        description="Aquesta secció reuneix accessos a panells operatius. Encara no hi ha edició inline de configuració global del lloc."
        icon={<Settings className="h-7 w-7 text-foreground/40" />}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Body = (
            <Card className="h-full hover:border-accent/30 transition-colors">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="rounded-lg border border-border bg-secondary/30 p-2">
                  <s.icon className="h-5 w-5 text-foreground/60" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {s.title}
                    {s.external && (
                      <ExternalLink className="h-3.5 w-3.5 text-foreground/40" />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/50">{s.description}</p>
              </CardContent>
            </Card>
          );
          return s.external ? (
            <a
              key={s.title}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {Body}
            </a>
          ) : (
            <Link key={s.title} href={s.href}>
              {Body}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pendents de configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/60">
          <p>
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/40 mr-2">
              roadmap
            </span>
            Edició de metadades globals (nom del lloc, idiomes actius, social links).
          </p>
          <p>
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/40 mr-2">
              roadmap
            </span>
            Plantilles d&apos;email per al contact form i notificacions.
          </p>
          <p>
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/40 mr-2">
              roadmap
            </span>
            Feature flags per activar/desactivar mòduls (blog, casos, labs).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
