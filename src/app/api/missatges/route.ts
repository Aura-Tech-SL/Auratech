import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { messageCreateSchema } from "@/lib/validations/message";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const role = (session.user as { role?: string }).role;

    // Admins can see all messages (for moderation / support).
    // Other users see only conversations they participate in.
    const where = isAdmin(role)
      ? {}
      : { OR: [{ senderId: userId }, { receiverId: userId }] };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cos invàlid" }, { status: 400 });
    }

    const parsed = messageCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0]?.message || "Dades no vàlides",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    // Confirm the recipient exists. Avoids creating dangling messages and
    // gives the client a clear 400 instead of a Prisma FK error 500.
    const receiver = await prisma.user.findUnique({
      where: { id: parsed.data.receiverId },
      select: { id: true },
    });
    if (!receiver) {
      return NextResponse.json(
        { error: "Destinatari no trobat" },
        { status: 400 }
      );
    }

    const senderId = (session.user as { id?: string }).id;
    if (!senderId) {
      return NextResponse.json(
        { error: "Sessió invàlida" },
        { status: 401 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: parsed.data.content,
        receiverId: parsed.data.receiverId,
        senderId, // forced from session — never trust the body
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error intern del servidor" },
      { status: 500 }
    );
  }
}
