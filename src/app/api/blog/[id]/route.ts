import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(["IOT", "CLOUD", "STRATEGY", "GENERAL"]).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
  readTime: z.number().int().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  locale: z.enum(["en", "ca", "es"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        blocks: { orderBy: { order: "asc" } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    if (post.status !== "PUBLISHED") {
      const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
      if (error) return error;
    }

    return NextResponse.json({ data: post });
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
    const data = updatePostSchema.parse(body);

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.blogPost.findFirst({ where: { slug: data.slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "El slug ja existeix" }, { status: 409 });
      }
    }

    const updateData: any = { ...data };
    if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: post });
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
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    if (post.status === "DRAFT") {
      await prisma.blogPost.delete({ where: { id: params.id } });
      return NextResponse.json({ data: { message: "Article eliminat" } });
    }

    await prisma.blogPost.update({
      where: { id: params.id },
      data: { status: "DRAFT" },
    });

    return NextResponse.json({ data: { message: "Article despublicat" } });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
