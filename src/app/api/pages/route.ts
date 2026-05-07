import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/slugify";
import { z } from "zod";

const createPageSchema = z.object({
  title: z.string().min(1, "El títol és obligatori"),
  slug: z.string().optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  locale: z.enum(["en", "ca", "es"]).default("ca"),
});

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const slug = searchParams.get("slug") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (slug) where.slug = slug;

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({
      data: pages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const body = await request.json();
    const data = createPageSchema.parse(body);

    const slug = data.slug || slugify(data.title);

    const existing = await prisma.page.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        locale: data.locale,
        authorId: session!.user.id,
      },
    });

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
