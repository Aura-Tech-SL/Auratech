/**
 * One-shot cleanup of expired rate-limit rows.
 *
 * Safe to run at any time. Removes rows whose window expired more than 1 day
 * ago — those can't possibly be useful and just waste storage / index space.
 *
 * Recommended cadence: daily, via cron. Not yet wired up automatically;
 * setup will land in a follow-up deployment-spec change.
 *
 * Usage (local):
 *   npx tsx prisma/cleanup-rate-limit.ts
 *
 * Usage (production):
 *   docker compose exec backend npx tsx prisma/cleanup-rate-limit.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
  const result = await prisma.rateLimit.deleteMany({
    where: { resetAt: { lt: cutoff } },
  });
  console.log(`[cleanup-rate-limit] Removed ${result.count} expired row(s).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
