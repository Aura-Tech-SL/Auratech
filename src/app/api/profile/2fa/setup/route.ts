/**
 * Begin the 2FA setup flow. Generates a fresh secret + 10 recovery codes,
 * stores the secret as `pendingSecret` (not yet active), and hashes the
 * recovery codes for storage. Returns the QR data URL and the codes in
 * cleartext — this is the only chance to see them.
 *
 * The user then proves possession by submitting a valid TOTP code to
 * /api/profile/2fa/confirm. Until that happens, twoFactorEnabled stays
 * false and the pendingSecret can be overwritten by another setup call.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { toDataURL as qrToDataURL } from "qrcode";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateSecret,
  generateOtpAuthUrl,
  generateRecoveryCodes,
} from "@/lib/totp";

export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  }

  const secret = generateSecret();
  const recoveryCodes = generateRecoveryCodes(10);
  // bcrypt cost 10 — high enough for ~32-bit codes, low enough not to make the
  // setup endpoint slow (10 hashes × ~80ms ≈ 0.8s).
  const hashedRecoveryCodes = await Promise.all(
    recoveryCodes.map((c) => hash(c, 10)),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorPendingSecret: secret,
      twoFactorRecoveryCodes: hashedRecoveryCodes,
    },
  });

  const otpAuthUrl = generateOtpAuthUrl(secret, user.email);
  const qrCode = await qrToDataURL(otpAuthUrl, { width: 240, margin: 1 });

  return NextResponse.json({
    secret,
    qrCode,
    recoveryCodes,
  });
}
