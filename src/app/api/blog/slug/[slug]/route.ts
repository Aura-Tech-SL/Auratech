import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: params.slug, status: "PUBLISHED" },
      include: {
        blocks: { orderBy: { order: "asc" } },
        author: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 }
    );
  }
}
