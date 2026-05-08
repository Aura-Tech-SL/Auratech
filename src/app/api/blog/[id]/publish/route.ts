import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAuth([
      "SUPERADMIN",
      "ADMIN",
      "EDITOR",
    ]);
    if (error) return error;

    const existing = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    const lastVersion = await prisma.blogPostVersion.findFirst({
      where: { blogPostId: params.id },
      orderBy: { version: "desc" },
    });
    const newVersion = (lastVersion?.version || 0) + 1;

    const [post] = await prisma.$transaction([
      prisma.blogPost.update({
        where: { id: params.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishAt: null,
        },
      }),
      prisma.blogPostVersion.create({
        data: {
          blogPostId: params.id,
          version: newVersion,
          data: {
            title: existing.title,
            slug: existing.slug,
            excerpt: existing.excerpt,
            coverImage: existing.coverImage,
            metaTitle: existing.metaTitle,
            metaDescription: existing.metaDescription,
            ogImage: existing.ogImage,
            tags: existing.tags,
            category: existing.category,
            blocks: existing.blocks,
          },
          createdById: session!.user.id,
        },
      }),
    ]);

    return NextResponse.json({ data: post });
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 },
    );
  }
}
