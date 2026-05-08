import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Flips matured SCHEDULED rows to PUBLISHED for both Page and BlogPost.
 * Designed to be called by a cron worker (Hetzner crontab) every few minutes.
 *
 * Auth: shared secret in `Authorization: Bearer <CRON_SECRET>`. Without the
 * env var set the endpoint refuses to run, so a misconfigured deploy fails
 * closed instead of becoming an unauthenticated mutation.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no està configurat" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (provided !== secret) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const now = new Date();

  const [pages, posts] = await prisma.$transaction([
    prisma.page.updateMany({
      where: { status: "SCHEDULED", publishAt: { lte: now } },
      data: { status: "PUBLISHED", publishedAt: now, publishAt: null },
    }),
    prisma.blogPost.updateMany({
      where: { status: "SCHEDULED", publishAt: { lte: now } },
      data: { status: "PUBLISHED", publishedAt: now, publishAt: null },
    }),
  ]);

  return NextResponse.json({
    data: {
      ranAt: now.toISOString(),
      published: { pages: pages.count, posts: posts.count },
    },
  });
}
