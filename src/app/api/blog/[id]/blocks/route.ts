import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  order: z.number(),
  data: z.record(z.any()).default({}),
  isVisible: z.boolean().default(true),
});

const updateBlocksSchema = z.object({
  blocks: z.array(blockSchema),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const body = await request.json();
    const { blocks } = updateBlocksSchema.parse(body);

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    await prisma.block.deleteMany({ where: { blogPostId: params.id } });

    await prisma.block.createMany({
      data: blocks.map((block, index) => ({
        type: block.type,
        order: block.order ?? index,
        data: block.data,
        isVisible: block.isVisible,
        blogPostId: params.id,
      })),
    });

    await prisma.blogPost.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    const savedBlocks = await prisma.block.findMany({
      where: { blogPostId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: savedBlocks });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no valides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
