import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/authz";

const updateSubmissionSchema = z.object({
  isRead: z.boolean().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "No autoritzat" }, { status: 401 }) };
  }
  if (!isAdmin(session.user.role)) {
    return {
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }
  return { session };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: params.id },
  });
  if (!submission) {
    return NextResponse.json({ error: "Missatge no trobat" }, { status: 404 });
  }
  return NextResponse.json({ data: submission });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cos invàlid" }, { status: 400 });
  }

  const parsed = updateSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message || "Dades no vàlides",
        details: parsed.error.errors,
      },
      { status: 400 },
    );
  }

  const existing = await prisma.contactSubmission.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Missatge no trobat" }, { status: 404 });
  }

  const updated = await prisma.contactSubmission.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  const existing = await prisma.contactSubmission.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Missatge no trobat" }, { status: 404 });
  }

  await prisma.contactSubmission.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
