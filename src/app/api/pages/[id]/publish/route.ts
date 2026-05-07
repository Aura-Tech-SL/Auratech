import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });

    if (!page) {
      return NextResponse.json({ error: "Pàgina no trobada" }, { status: 404 });
    }

    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId: params.id },
      orderBy: { version: "desc" },
    });

    const newVersion = (lastVersion?.version || 0) + 1;

    const [updatedPage] = await prisma.$transaction([
      prisma.page.update({
        where: { id: params.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
      prisma.pageVersion.create({
        data: {
          pageId: params.id,
          version: newVersion,
          data: {
            title: page.title,
            slug: page.slug,
            description: page.description,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            blocks: page.blocks,
          },
          createdById: session!.user.id,
        },
      }),
    ]);

    return NextResponse.json({ data: updatedPage });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
