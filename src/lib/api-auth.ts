import { getServerSession, type Session } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

type Role = Session["user"]["role"];

export async function requireAuth(roles?: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "No autenticat" }, { status: 401 }),
      session: null,
    };
  }
  if (roles && !roles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "No autoritzat" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}
