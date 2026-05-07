/**
 * GDPR Article 20 (right to data portability) endpoint.
 *
 * Returns every row in the database that's tied to the authenticated user,
 * as a downloadable JSON file. The set covers User profile + Project +
 * Invoice + Message (sent and received) + ContactSubmission rows that
 * match the user's email.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAuditEvent, getRequestIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const [user, projects, invoices, sentMessages, receivedMessages, contactSubmissions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          company: true,
          role: true,
          isActive: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.project.findMany({ where: { userId } }),
      prisma.invoice.findMany({ where: { userId } }),
      prisma.message.findMany({ where: { senderId: userId } }),
      prisma.message.findMany({ where: { receiverId: userId } }),
      userEmail
        ? prisma.contactSubmission.findMany({ where: { email: userEmail } })
        : Promise.resolve([]),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    projects,
    invoices,
    sentMessages,
    receivedMessages,
    contactSubmissions,
  };

  await logAuditEvent({
    action: "user_exported",
    actorId: userId,
    actorEmail: userEmail,
    ipAddress: getRequestIp(request.headers),
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="auratech-data-${date}.json"`,
    },
  });
}
