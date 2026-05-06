import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function requireAuth(roles?: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "No autenticat" }, { status: 401 }), session: null };
  }
  if (roles && !roles.includes((session.user as any).role)) {
    return { error: NextResponse.json({ error: "No autoritzat" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
