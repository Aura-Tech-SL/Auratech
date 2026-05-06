import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  client: z.string().optional(),
  category: z.enum(["IOT", "CLOUD", "STRATEGY"]).optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  userId: z.string().nullable().optional(),
  locale: z.enum(["en", "ca", "es"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projecte no trobat" }, { status: 404 });
    }

    if (!project.isActive) {
      const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
      if (error) return error;
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Projecte no trobat" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.project.findFirst({ where: { slug: data.slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
      }
    }

    const updateData: any = { ...data };
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: project });
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

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Projecte no trobat" }, { status: 404 });
    }

    await prisma.project.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: { message: "Projecte desactivat" } });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
