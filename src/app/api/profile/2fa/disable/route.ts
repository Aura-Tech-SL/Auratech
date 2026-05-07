/**
 * Disable 2FA. Requires re-authentication with current password + a valid
 * TOTP code (or recovery code) to prevent a malicious actor with a hijacked
 * session from turning it off.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyTotp } from "@/lib/totp";
import { logAuditEvent, getRequestIp } from "@/lib/audit";

const schema = z.object({
  password: z.string().min(1),
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
    return NextResponse.json({ error: "Dades invàlides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  }
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json(
      { error: "El 2FA ja està desactivat" },
      { status: 400 },
    );
  }

  const passwordValid = await compare(parsed.data.password, user.password);
  if (!passwordValid) {
    return NextResponse.json(
      { error: "Contrasenya incorrecta" },
      { status: 403 },
    );
  }

  // Accept TOTP or a recovery code.
  let codeValid = false;
  const code = parsed.data.code.trim();
  if (/^\d{6}$/.test(code.replace(/\s+/g, ""))) {
    codeValid = verifyTotp(user.twoFactorSecret, code);
  } else {
    const normalised = code.toUpperCase();
    for (const hashed of user.twoFactorRecoveryCodes) {
      // eslint-disable-next-line no-await-in-loop
      if (await compare(normalised, hashed)) {
        codeValid = true;
        break;
      }
    }
  }

  if (!codeValid) {
    await logAuditEvent({
      action: "2fa_failed",
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: getRequestIp(request.headers),
      metadata: { phase: "disable" },
    });
    return NextResponse.json({ error: "Codi invàlid" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
      twoFactorRecoveryCodes: [],
    },
  });

  await logAuditEvent({
    action: "2fa_disabled",
    actorId: user.id,
    actorEmail: user.email,
    ipAddress: getRequestIp(request.headers),
  });

  return NextResponse.json({ success: true });
}
