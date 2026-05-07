/**
 * Confirm the 2FA setup by verifying a TOTP code against the pending secret.
 * On success, promote pendingSecret to secret and set twoFactorEnabled=true.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyTotp } from "@/lib/totp";
import { logAuditEvent, getRequestIp } from "@/lib/audit";

const schema = z.object({
  code: z.string().min(1).max(20),
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
    return NextResponse.json({ error: "Codi requerit" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  }
  if (!user.twoFactorPendingSecret) {
    return NextResponse.json(
      { error: "Cap setup en curs. Torna a iniciar el procés." },
      { status: 400 },
    );
  }

  if (!verifyTotp(user.twoFactorPendingSecret, parsed.data.code)) {
    await logAuditEvent({
      action: "2fa_failed",
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: getRequestIp(request.headers),
      metadata: { phase: "setup_confirm" },
    });
    return NextResponse.json({ error: "Codi invàlid" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingSecret: null,
      twoFactorEnabled: true,
    },
  });

  await logAuditEvent({
    action: "2fa_enabled",
    actorId: user.id,
    actorEmail: user.email,
    ipAddress: getRequestIp(request.headers),
  });

  return NextResponse.json({ success: true });
}
