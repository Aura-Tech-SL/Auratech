import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAuditEvent, getRequestIp } from "@/lib/audit";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Contrasenya actual requerida"),
  newPassword: z
    .string()
    .min(8, "La nova contrasenya ha de tenir almenys 8 caràcters")
    .max(72, "Massa llarga (màx 72 caràcters)"),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticat" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cos invàlid" }, { status: 400 });
  }

  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Dades invàlides" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  }

  const matches = await compare(parsed.data.currentPassword, user.password);
  if (!matches) {
    return NextResponse.json(
      { error: "Contrasenya actual incorrecta" },
      { status: 403 }
    );
  }

  const hashed = await hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  await logAuditEvent({
    action: "password_changed",
    actorId: user.id,
    actorEmail: user.email,
    ipAddress: getRequestIp(request.headers),
  });

  return NextResponse.json({ message: "Contrasenya actualitzada" });
}
