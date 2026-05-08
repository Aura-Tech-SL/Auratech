import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishAt: null,
      },
    });

    return NextResponse.json({ data: post });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
