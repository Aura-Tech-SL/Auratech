/**
 * Authorisation helpers for ownership-based checks (IDOR prevention).
 *
 * Used by API routes that expose resources tied to specific users.
 * See openspec/changes/2026-05-06-security-week-1/specs/api/spec.md
 * "Resource ownership enforcement" requirement.
 */

export const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface SessionLike {
  user?: {
    id?: string;
    role?: string;
    email?: string | null;
    name?: string | null;
  };
}

/** True when the role is in the admin tier (full access). */
export function isAdmin(role: string | undefined | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * True when the session user can access a resource owned by `resourceOwnerId`.
 *
 * - Returns true if the session user has SUPERADMIN or ADMIN role (admins see
 *   everything).
 * - Returns true if `resourceOwnerId === session.user.id`.
 * - Returns false otherwise (including when the session is missing).
 */
export function ownsResource(
  resourceOwnerId: string | null | undefined,
  session: SessionLike | null | undefined,
): boolean {
  if (!session?.user?.id) return false;
  if (isAdmin(session.user.role)) return true;
  if (!resourceOwnerId) return false;
  return resourceOwnerId === session.user.id;
}
