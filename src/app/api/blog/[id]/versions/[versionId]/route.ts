import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN", "EDITOR"]);
    if (error) return error;

    const version = await prisma.blogPostVersion.findFirst({
      where: { id: params.versionId, blogPostId: params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Versió no trobada" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: version });
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 },
    );
  }
}
