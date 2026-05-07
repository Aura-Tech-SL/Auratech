import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1, "Nom requerit").max(100),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticat" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      role: true,
      avatar: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Dades invàlides" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      company: parsed.data.company ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
