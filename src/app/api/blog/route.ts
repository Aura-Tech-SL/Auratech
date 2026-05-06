import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/slugify";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1, "El títol és obligatori"),
  slug: z.string().optional(),
  excerpt: z.string().min(1, "L'extracte és obligatori"),
  coverImage: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  category: z.enum(["IOT", "CLOUD", "STRATEGY", "GENERAL"]).default("GENERAL"),
  readTime: z.number().int().nullable().optional(),
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

    const where: any = {};
    if (status === "PUBLISHED") {
      // Public access: no auth required for published posts
      where.status = "PUBLISHED";
    } else {
      // Require auth for listing drafts or all posts
      const { error, session } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
      if (error) {
        // Not authenticated: only show published posts
        where.status = "PUBLISHED";
      } else if (status) {
        where.status = status;
      }
    }
    if (category) where.category = category;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
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
    const data = createPostSchema.parse(body);

    const slug = data.slug || slugify(data.title);

    const existing = await prisma.blogPost.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: data.tags,
        category: data.category,
        readTime: data.readTime,
        locale: data.locale,
        authorId: (session!.user as any).id,
      },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
