import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const versions = await prisma.blogPostVersion.findMany({
      where: { blogPostId: params.id },
      orderBy: { version: "desc" },
      take: 30,
      select: {
        id: true,
        version: true,
        createdAt: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: versions });
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 },
    );
  }
}
