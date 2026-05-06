import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/slugify";
import { z } from "zod";

const createServiceSchema = z.object({
  name: z.string().min(1, "El nom és obligatori"),
  slug: z.string().optional(),
  description: z.string().min(1, "La descripció és obligatòria"),
  icon: z.string().min(1, "La icona és obligatòria"),
  features: z.any().default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  locale: z.enum(["en", "ca", "es"]).default("ca"),
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: services });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const data = createServiceSchema.parse(body);

    const slug = data.slug || slugify(data.name);

    const existing = await prisma.service.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        features: data.features,
        order: data.order,
        isActive: data.isActive,
        locale: data.locale,
      },
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
