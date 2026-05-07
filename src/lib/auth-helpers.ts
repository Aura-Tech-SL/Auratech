/**
 * Type-safe wrappers around getServerSession.
 *
 * NextAuth's Session.user is augmented in src/types/next-auth.d.ts to
 * include `id`, `role`, and `twoFactorEnabled`. With these helpers, API
 * routes can stop using `as unknown as` / `as any` casts and let
 * TypeScript narrow the session correctly.
 */
import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AuthSession = Session;
export type AuthUser = Session["user"];

const ADMIN_ROLES_DEFAULT: AuthUser["role"][] = [
  "SUPERADMIN",
  "ADMIN",
];

/**
 * Get the current session or null. Drop-in replacement for
 * `getServerSession(authOptions)` with the typed Session.
 */
export async function getSession(): Promise<AuthSession | null> {
  return getServerSession(authOptions);
}

/**
 * Convenience for endpoints that need to bail out with 401 when there's
 * no session. Returns either the session or a JsonResponse error to
 * return immediately.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if ("error" in auth) return auth.error;
 *   // auth.session is now typed Session
 */
export async function requireAuth(): Promise<
  { session: AuthSession } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "No autoritzat" }, { status: 401 }),
    };
  }
  return { session };
}

/**
 * Same as requireAuth but also enforces a role allowlist.
 */
export async function requireRole(
  roles: AuthUser["role"][] = ADMIN_ROLES_DEFAULT,
): Promise<{ session: AuthSession } | { error: NextResponse }> {
  const auth = await requireAuth();
  if ("error" in auth) return auth;
  if (!roles.includes(auth.session.user.role)) {
    return {
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }
  return auth;
}
