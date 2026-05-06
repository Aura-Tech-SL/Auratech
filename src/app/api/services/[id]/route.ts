import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  features: z.any().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  locale: z.enum(["en", "ca", "es"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const data = updateServiceSchema.parse(body);

    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Servei no trobat" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.service.findFirst({ where: { slug: data.slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
      }
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ data: service });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Servei no trobat" }, { status: 404 });
    }

    await prisma.service.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { message: "Servei eliminat" } });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
