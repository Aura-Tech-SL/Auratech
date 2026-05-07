/**
 * GDPR Article 17 (right to erasure) endpoint.
 *
 * We anonymise rather than physically delete: identifiable fields on the
 * User row are replaced with placeholder values, the password is randomised
 * (so login becomes impossible), and isActive is set to false. Records
 * tied to the user (Project, Invoice) are kept intact because Spanish
 * accounting law requires retaining invoices for 6 years (RGPD Article
 * 6.1.c). Messages have their content blanked. ContactSubmission rows
 * matched by email are anonymised in place.
 *
 * Body must include `{ confirmation: "ELIMINAR" }` to prevent accidental
 * deletion via XSRF or misclicks.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAuditEvent, getRequestIp } from "@/lib/audit";

const schema = z.object({
  confirmation: z.literal("ELIMINAR"),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cos invàlid" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Cal confirmar escrivint la paraula \"ELIMINAR\" exactament.",
      },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const anonymousEmail = `deleted-${randomBytes(8).toString("hex")}@anonymized.local`;
  const randomPassword = await hash(randomBytes(32).toString("hex"), 12);

  await prisma.$transaction(async (tx) => {
    // Anonymise the User row — login becomes impossible.
    await tx.user.update({
      where: { id: userId },
      data: {
        email: anonymousEmail,
        name: "[Compte eliminat]",
        phone: null,
        company: null,
        avatar: null,
        password: randomPassword,
        isActive: false,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorRecoveryCodes: [],
      },
    });

    // Blank message content; metadata stays for the counterparty.
    await tx.message.updateMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      data: { content: "[Missatge eliminat]" },
    });

    // Anonymise ContactSubmission rows tied to the user's email.
    if (userEmail) {
      await tx.contactSubmission.updateMany({
        where: { email: userEmail },
        data: {
          name: "[Eliminat]",
          email: anonymousEmail,
          phone: null,
          message: "[Missatge eliminat]",
        },
      });
    }
  });

  await logAuditEvent({
    action: "user_deleted",
    actorId: userId,
    actorEmail: userEmail,
    targetType: "User",
    targetId: userId,
    ipAddress: getRequestIp(request.headers),
  });

  return NextResponse.json({
    success: true,
    message: "Compte anonimitzat. Rediregirem a la pàgina d'inici.",
  });
}
