import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ownsResource } from "@/lib/authz";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
    }

    const allowedRoles = ["SUPERADMIN", "ADMIN", "EDITOR"];
    const role = (session.user as { role?: string }).role;
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) {
      return NextResponse.json({ error: "Fitxer no trobat" }, { status: 404 });
    }

    // Ownership: admins delete anything; EDITOR only deletes media they uploaded.
    if (
      !ownsResource(media.uploadedById, {
        user: {
          id: (session.user as { id?: string }).id,
          role,
        },
      })
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
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
