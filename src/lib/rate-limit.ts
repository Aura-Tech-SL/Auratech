/**
 * Generic rate limiter backed by Postgres (model `RateLimit`).
 *
 * Trade-offs vs Redis: see openspec/changes/archive/2026-05-06-security-week-1/design.md §1.
 * Migration path: the public signature of `checkRateLimit` is the API; replacing
 * the Postgres backing with Redis is an internal swap of this file.
 */
import { prisma } from "@/lib/db";

export interface RateLimitResult {
  /** True if the request is within the limit and SHOULD be allowed to proceed. */
  allowed: boolean;
  /** Number of attempts remaining in the current window (>= 0). */
  remaining: number;
  /** When the current window resets (UTC). */
  resetAt: Date;
}

/**
 * Atomic check-and-increment of a rate-limit counter.
 *
 * Uses an UPSERT inside a transaction so concurrent requests cannot bypass the
 * limit by hitting `findFirst → create` race conditions.
 *
 * @param key      Identifier of the counter. Conventional format: `<scope>:<id>`,
 *                 e.g. `"login:203.0.113.42"` or `"api:user-abc-123"`.
 * @param max      Maximum allowed attempts in the window.
 * @param windowMs Window duration in milliseconds.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });

    // Either no record yet, or the previous window has already expired —
    // start a fresh window with count = 1.
    if (!existing || existing.resetAt <= now) {
      const resetAt = new Date(now.getTime() + windowMs);
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { allowed: true, remaining: Math.max(0, max - 1), resetAt };
    }

    // Window still open. Increment.
    const updated = await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    const allowed = updated.count <= max;
    const remaining = Math.max(0, max - updated.count);
    return { allowed, remaining, resetAt: updated.resetAt };
  });
}

/**
 * Reset a counter (e.g. on a successful login, so the bad-attempt budget is
 * not consumed by a user who eventually got their password right).
 */
export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

/**
 * Helper for callers that need to know "have I been blocked?" without
 * incrementing the counter (e.g. UI showing remaining attempts).
 */
export async function peekRateLimit(
  key: string,
  max: number,
): Promise<RateLimitResult | null> {
  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  if (!existing) return null;
  const now = new Date();
  if (existing.resetAt <= now) return null;
  return {
    allowed: existing.count <= max,
    remaining: Math.max(0, max - existing.count),
    resetAt: existing.resetAt,
  };
}
