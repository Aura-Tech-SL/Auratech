import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const scheduleSchema = z.object({
  publishAt: z.string().datetime(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const body = await request.json();
    const { publishAt } = scheduleSchema.parse(body);
    const when = new Date(publishAt);

    if (when.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "La data de publicació ha de ser al futur" },
        { status: 400 },
      );
    }

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: { status: "SCHEDULED", publishAt: when, publishedAt: null },
    });

    return NextResponse.json({ data: page });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Dades no vàlides", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    if (existing.status !== "SCHEDULED") {
      return NextResponse.json({ data: existing });
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: { status: "DRAFT", publishAt: null },
    });

    return NextResponse.json({ data: page });
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 },
    );
  }
}
