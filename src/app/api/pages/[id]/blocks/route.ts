import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  order: z.number().int().min(0),
  data: z.any().default({}),
  isVisible: z.boolean().default(true),
});

const updateBlocksSchema = z.object({
  blocks: z.array(blockSchema),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({ where: { id: params.id } });
    if (!page) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    const blocks = await prisma.block.findMany({
      where: { pageId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: blocks });
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
    const { blocks } = updateBlocksSchema.parse(body);

    const page = await prisma.page.findUnique({ where: { id: params.id } });
    if (!page) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    const incomingIds = blocks.filter((b) => b.id).map((b) => b.id!);

    await prisma.$transaction(async (tx) => {
      // Delete blocks that are no longer present
      await tx.block.deleteMany({
        where: {
          pageId: params.id,
          id: { notIn: incomingIds },
        },
      });

      // Upsert each block
      for (const block of blocks) {
        if (block.id) {
          await tx.block.update({
            where: { id: block.id },
            data: {
              type: block.type,
              order: block.order,
              data: block.data,
              isVisible: block.isVisible,
            },
          });
        } else {
          await tx.block.create({
            data: {
              type: block.type,
              order: block.order,
              data: block.data,
              isVisible: block.isVisible,
              pageId: params.id,
            },
          });
        }
      }
    });

    const updatedBlocks = await prisma.block.findMany({
      where: { pageId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: updatedBlocks });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
