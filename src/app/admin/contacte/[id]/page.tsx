import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ContactSubmissionActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContactSubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isAdmin(session.user.role)) redirect("/dashboard");

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: params.id },
  });
  if (!submission) notFound();

  // Auto-mark as read on first view (per spec).
  if (!submission.isRead) {
    await prisma.contactSubmission.update({
      where: { id: params.id },
      data: { isRead: true },
    });
    submission.isRead = true;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/contacte">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tornar a la llista
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{submission.subject}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(submission.createdAt)}</span>
            <Badge variant={submission.isRead ? "outline" : "default"}>
              {submission.isRead ? "Llegit" : "Nou"}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Remitent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Nom
            </div>
            <div className="font-medium">{submission.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Email
            </div>
            <a
              href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(
                submission.subject,
              )}`}
              className="flex items-center gap-2 text-accent hover:underline"
            >
              <Mail className="h-4 w-4" />
              {submission.email}
            </a>
          </div>
          {submission.phone && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Telèfon
              </div>
              <a
                href={`tel:${submission.phone}`}
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <Phone className="h-4 w-4" />
                {submission.phone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missatge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {submission.message}
          </p>
        </CardContent>
      </Card>

      <ContactSubmissionActions
        id={submission.id}
        initialNotes={submission.notes ?? ""}
        initialIsRead={submission.isRead}
      />
    </div>
  );
}
