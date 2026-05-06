import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAuth(["SUPERADMIN", "ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const { ids } = reorderSchema.parse(body);

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ data: { message: "Ordre actualitzat" } });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Dades no vàlides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
