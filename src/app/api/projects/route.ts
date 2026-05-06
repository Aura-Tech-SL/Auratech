import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/slugify";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "El nom és obligatori"),
  slug: z.string().optional(),
  client: z.string().min(1, "El client és obligatori"),
  category: z.enum(["IOT", "CLOUD", "STRATEGY"]).default("IOT"),
  description: z.string().min(1, "La descripció és obligatòria"),
  technologies: z.array(z.string()).default([]),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).default("PENDING"),
  progress: z.number().int().min(0).max(100).default(0),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  userId: z.string().nullable().optional(),
  locale: z.enum(["en", "ca", "es"]).default("ca"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const activeOnly = searchParams.get("active");

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (activeOnly === "true") where.isActive = true;

    // Public requests only see active projects; auth users see all
    const { session } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (!session) {
      where.isActive = true;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { order: "asc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, company: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const slug = data.slug || slugify(data.name);

    const existing = await prisma.project.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        slug,
        client: data.client,
        category: data.category,
        description: data.description,
        technologies: data.technologies,
        image: data.image,
        isActive: data.isActive,
        order: data.order,
        status: data.status,
        progress: data.progress,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        userId: data.userId,
        locale: data.locale,
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
