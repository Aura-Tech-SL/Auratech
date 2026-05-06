import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) {
      return NextResponse.json({ error: "Fitxer no trobat" }, { status: 404 });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), "public", media.url);
    try {
      await unlink(filePath);
    } catch {
      // File may already be deleted from disk, continue with DB cleanup
    }

    await prisma.media.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { message: "Fitxer eliminat" } });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
