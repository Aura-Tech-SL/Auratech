import { NextResponse } from "next/server";

// Some SEO crawlers request `/sitemap-index.xml` even when our manifest is at
// `/sitemap.xml`. 301 them so they land on the real sitemap and stop firing
// "Cannot find module './sitemap-index.xml.json'" 404s in Sentry.
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/sitemap.xml", request.url), 301);
}
