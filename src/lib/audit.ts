/**
 * Append-only audit trail for security-relevant events.
 *
 * Failures to write are swallowed and logged to console.warn — an audit
 * insert that fails MUST NOT break the user-facing request.
 *
 * Usage:
 *   await logAuditEvent({
 *     action: "login_success",
 *     actorId: user.id,
 *     actorEmail: user.email,
 *     ipAddress: getRequestIp(req),
 *   });
 *
 * Conventional action ids (lowercase snake_case):
 *   login_success | login_failed
 *   password_changed
 *   2fa_enabled | 2fa_disabled | 2fa_failed | 2fa_recovery_used
 *   role_changed
 *   user_deleted | user_exported
 *   page_published | page_archived
 *   media_deleted
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "password_changed"
  | "2fa_enabled"
  | "2fa_disabled"
  | "2fa_failed"
  | "2fa_recovery_used"
  | "role_changed"
  | "user_deleted"
  | "user_exported"
  | "page_published"
  | "page_archived"
  | "media_deleted";

export interface AuditEntry {
  action: AuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: (entry.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // never let audit write break the request
    console.warn("[audit] write failed", err);
  }
}

/**
 * Pick a client IP from the standard reverse-proxy headers.
 * Used by API route handlers and the auth callback.
 */
export function getRequestIp(headers: {
  get?: (key: string) => string | null;
}): string | null {
  if (typeof headers?.get !== "function") return null;
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = headers.get("x-real-ip");
  if (xri) return xri;
  return null;
}
