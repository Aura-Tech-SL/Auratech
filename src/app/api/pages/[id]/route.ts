import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  template: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  locale: z.enum(["en", "ca", "es"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        blocks: { orderBy: { order: "asc" } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    if (page.status !== "PUBLISHED") {
      const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
      if (error) return error;
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const body = await request.json();
    const data = updatePageSchema.parse(body);

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.page.findFirst({ where: { slug: data.slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
      }
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ data: page });
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

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    await prisma.page.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ data: { message: "Pàgina arxivada" } });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
